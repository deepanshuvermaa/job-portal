type MockUserRole = 'worker' | 'employer' | 'admin';

interface MockUser {
  id: string;
  phone: string;
  role: MockUserRole;
  name: string;
  password?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface MockWorkerProfile {
  user_id: string;
  full_name: string;
  address?: string;
  city?: string;
  skills?: string[];
  experience_years?: number;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  average_rating?: number;
  documents?: { type: string; name: string }[];
}

interface MockEmployerProfile {
  user_id: string;
  business_name?: string;
  business_type?: string;
  address?: string;
  city?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  documents?: { type: string; name: string }[];
}

interface MockJob {
  id: string;
  employer_id: string;
  title: string;
  description?: string;
  job_type?: string;
  employment_type?: string;
  city?: string;
  location?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_type?: string;
  required_skills?: string[];
  working_hours?: string | null;
  status: 'pending' | 'active' | 'closed' | 'rejected';
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface MockApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
  cover_letter?: string | null;
  expected_salary?: number | null;
  created_at: string;
  updated_at: string;
}

interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface MockOtp {
  phone: string;
  otp: string;
  expires_at: number;
  created_at: string;
}

interface MockDb {
  users: MockUser[];
  worker_profiles: MockWorkerProfile[];
  employer_profiles: MockEmployerProfile[];
  jobs: MockJob[];
  applications: MockApplication[];
  notifications: MockNotification[];
  otps: MockOtp[];
  counters: {
    user: number;
    job: number;
    application: number;
    notification: number;
  };
}

const STORAGE_KEY = 'mock-db';
const ADMIN_PASSWORD = 'admin123';
const MOCK_OTP = '123456';

const now = () => new Date().toISOString();

const createDefaultDb = (): MockDb => ({
  users: [
    {
      id: 'admin-1',
      phone: 'admin',
      role: 'admin',
      name: 'Admin',
      password: ADMIN_PASSWORD,
      verification_status: 'approved',
      created_at: now(),
      updated_at: now(),
    },
  ],
  worker_profiles: [],
  employer_profiles: [],
  jobs: [],
  applications: [],
  notifications: [],
  otps: [],
  counters: {
    user: 1,
    job: 1,
    application: 1,
    notification: 1,
  },
});

const loadDb = (): MockDb => {
  if (typeof window === 'undefined') return createDefaultDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createDefaultDb();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as MockDb;
  } catch {
    const seeded = createDefaultDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const saveDb = (db: MockDb) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const nextId = (db: MockDb, key: keyof MockDb['counters']) => {
  db.counters[key] += 1;
  return `${key}-${db.counters[key]}`;
};

const getAuthState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state || null;
  } catch {
    return null;
  }
};

const requireUser = (role?: MockUserRole) => {
  const db = loadDb();
  const auth = getAuthState();
  const userId = auth?.user?.id;
  if (!userId) {
    throwMockError('Not authenticated');
  }
  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    throwMockError('User not found');
  }
  if (role && user.role !== role) {
    throwMockError('Unauthorized');
  }
  return { db, user };
};

const toUserResponse = (user: MockUser) => ({
  id: user.id,
  phone: user.phone,
  role: user.role,
  name: user.name,
  verificationStatus: user.verification_status,
  verification_status: user.verification_status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const createTokens = (user: MockUser) => ({
  accessToken: `mock-access-${user.id}-${Date.now()}`,
  refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
});

const addNotification = (db: MockDb, userId: string, title: string, message: string) => {
  const id = nextId(db, 'notification');
  db.notifications.unshift({
    id,
    user_id: userId,
    title,
    message,
    is_read: false,
    created_at: now(),
  });
};

const throwMockError = (message: string) => {
  const error: any = new Error(message);
  error.response = { data: { error: message } };
  throw error;
};

export const mockSendOtp = async (phone: string) => {
  const db = loadDb();
  db.otps = db.otps.filter((otp) => otp.phone !== phone);
  db.otps.push({
    phone,
    otp: MOCK_OTP,
    expires_at: Date.now() + 5 * 60 * 1000,
    created_at: now(),
  });
  saveDb(db);
  return { success: true };
};

export const mockVerifyOtp = async (phone: string, otp: string) => {
  const db = loadDb();
  // In mock mode, accept any OTP - just check if user exists
  const existingUser = db.users.find((item) => item.phone === phone);
  if (!existingUser) {
    return {
      verified: true,
      signupRequired: true,
    };
  }

  return {
    verified: true,
    signupRequired: false,
    user: toUserResponse(existingUser),
    tokens: createTokens(existingUser),
  };
};

export const mockRegisterWorker = async (payload: Record<string, any>) => {
  const db = loadDb();
  const existing = db.users.find((item) => item.phone === payload.phone);
  if (existing) {
    throwMockError('User already exists');
  }

  const id = nextId(db, 'user');
  const user: MockUser = {
    id,
    phone: payload.phone,
    role: 'worker',
    name: payload.full_name || 'Worker',
    password: payload.password,
    verification_status: 'pending',
    created_at: now(),
    updated_at: now(),
  };

  db.users.push(user);
  db.worker_profiles.push({
    user_id: id,
    full_name: payload.full_name || 'Worker',
    address: payload.address,
    city: payload.city,
    skills: payload.skills || [],
    experience_years: payload.experience_years,
    preferred_job_types: payload.preferred_job_types || [],
    preferred_locations: payload.preferred_locations || [],
    verification_status: 'pending',
    average_rating: 0,
  });

  addNotification(db, id, 'Verification Pending', 'Your profile is under review.');
  saveDb(db);

  return {
    user: toUserResponse(user),
    tokens: createTokens(user),
  };
};

export const mockRegisterEmployer = async (payload: Record<string, any>) => {
  const db = loadDb();
  const existing = db.users.find((item) => item.phone === payload.phone);
  if (existing) {
    throwMockError('User already exists');
  }

  const id = nextId(db, 'user');
  const user: MockUser = {
    id,
    phone: payload.phone,
    role: 'employer',
    name: payload.business_name || 'Employer',
    password: payload.password,
    verification_status: 'pending',
    created_at: now(),
    updated_at: now(),
  };

  db.users.push(user);
  db.employer_profiles.push({
    user_id: id,
    business_name: payload.business_name,
    business_type: payload.business_type,
    address: payload.address,
    city: payload.city,
    verification_status: 'pending',
  });

  addNotification(db, id, 'Verification Pending', 'Your business verification is pending.');
  saveDb(db);

  return {
    user: toUserResponse(user),
    tokens: createTokens(user),
  };
};

export const mockLogin = async (phone: string, password: string) => {
  const db = loadDb();
  const user = db.users.find((item) => item.phone === phone && item.password === password);
  if (!user) {
    throwMockError('Invalid credentials');
  }
  return {
    user: toUserResponse(user),
    tokens: createTokens(user),
  };
};

export const mockAdminLogin = async (password: string) => {
  if (password !== ADMIN_PASSWORD) {
    throwMockError('Invalid admin credentials');
  }
  const db = loadDb();
  const admin = db.users.find((item) => item.role === 'admin') || db.users[0];
  return {
    user: toUserResponse(admin),
    tokens: createTokens(admin),
  };
};

export const mockLoadCurrentUser = async () => {
  const db = loadDb();
  const auth = getAuthState();
  const userId = auth?.user?.id;
  if (!userId) {
    throwMockError('Not authenticated');
  }
  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    throwMockError('User not found');
  }
  return toUserResponse(user);
};

export const mockGetWorkerProfile = async () => {
  const { db } = requireUser('worker');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.worker_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  return profile;
};

export const mockUpdateWorkerProfile = async (payload: Record<string, any>) => {
  const { db } = requireUser('worker');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.worker_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  Object.assign(profile, payload);
  saveDb(db);
  return profile;
};

export const mockGetEmployerProfile = async () => {
  const { db } = requireUser('employer');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.employer_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  return profile;
};

export const mockUpdateEmployerProfile = async (payload: Record<string, any>) => {
  const { db } = requireUser('employer');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.employer_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  Object.assign(profile, payload);
  saveDb(db);
  return profile;
};

export const mockUploadWorkerDocument = async (documentType: string, file: File) => {
  const { db } = requireUser('worker');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.worker_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  profile.documents = profile.documents || [];
  profile.documents.push({ type: documentType, name: file.name });
  saveDb(db);
  return { success: true };
};

export const mockUploadEmployerDocument = async (documentType: string, file: File) => {
  const { db } = requireUser('employer');
  const auth = getAuthState();
  const userId = auth?.user?.id;
  const profile = db.employer_profiles.find((item) => item.user_id === userId);
  if (!profile) {
    throwMockError('Profile not found');
  }
  profile.documents = profile.documents || [];
  profile.documents.push({ type: documentType, name: file.name });
  saveDb(db);
  return { success: true };
};

export const mockSearchJobs = async (params: Record<string, any>) => {
  const db = loadDb();
  const city = params?.city?.toLowerCase();
  const jobType = params?.jobType;

  return db.jobs.filter((job) => {
    if (job.status !== 'active' || job.verification_status !== 'approved') return false;
    if (city && job.city && job.city.toLowerCase() !== city) return false;
    if (jobType && job.job_type !== jobType) return false;
    return true;
  });
};

export const mockGetJob = async (jobId: string) => {
  const db = loadDb();
  const job = db.jobs.find((item) => item.id === jobId);
  if (!job) {
    throwMockError('Job not found');
  }
  const employer = db.employer_profiles.find((item) => item.user_id === job.employer_id);
  return {
    ...job,
    employer_profiles: employer ? { business_name: employer.business_name } : null,
  };
};

export const mockApplyToJob = async (jobId: string, payload: Record<string, any>) => {
  const { db, user } = requireUser('worker');
  const job = db.jobs.find((item) => item.id === jobId);
  if (!job) {
    throwMockError('Job not found');
  }
  const existing = db.applications.find((app) => app.job_id === jobId && app.worker_id === user.id);
  if (existing) {
    throwMockError('You have already applied');
  }

  const id = nextId(db, 'application');
  db.applications.push({
    id,
    job_id: jobId,
    worker_id: user.id,
    status: 'sent',
    cover_letter: payload.cover_letter || null,
    expected_salary: payload.expected_salary || null,
    created_at: now(),
    updated_at: now(),
  });

  addNotification(db, job.employer_id, 'New Application', `A worker applied for ${job.title}.`);
  saveDb(db);
  return { success: true };
};

export const mockGetWorkerApplications = async () => {
  const { db, user } = requireUser('worker');
  return db.applications
    .filter((app) => app.worker_id === user.id)
    .map((app) => ({
      ...app,
      jobs: db.jobs.find((job) => job.id === app.job_id),
    }));
};

export const mockCreateJob = async (payload: Record<string, any>) => {
  const { db, user } = requireUser('employer');
  const id = nextId(db, 'job');
  const job: MockJob = {
    id,
    employer_id: user.id,
    title: payload.title,
    description: payload.description,
    job_type: payload.job_type,
    employment_type: payload.employment_type,
    city: payload.city,
    location: payload.location,
    salary_min: payload.salary_min ?? null,
    salary_max: payload.salary_max ?? null,
    salary_type: payload.salary_type,
    required_skills: payload.required_skills || [],
    working_hours: payload.working_hours || null,
    status: 'pending',
    verification_status: 'pending',
    created_at: now(),
    updated_at: now(),
  };
  db.jobs.unshift(job);
  addNotification(db, user.id, 'Job Submitted', 'Your job is pending approval.');
  saveDb(db);
  return job;
};

export const mockGetEmployerJobs = async () => {
  const { db, user } = requireUser('employer');
  return db.jobs
    .filter((job) => job.employer_id === user.id)
    .map((job) => ({
      ...job,
      applications_count: db.applications.filter((app) => app.job_id === job.id).length,
    }));
};

export const mockGetEmployerJobApplications = async (jobId: string) => {
  const { db, user } = requireUser('employer');
  const job = db.jobs.find((item) => item.id === jobId && item.employer_id === user.id);
  if (!job) {
    throwMockError('Job not found');
  }
  return db.applications
    .filter((app) => app.job_id === jobId)
    .map((app) => {
      const worker = db.worker_profiles.find((profile) => profile.user_id === app.worker_id);
      return {
        ...app,
        worker_profiles: worker ? { full_name: worker.full_name } : null,
      };
    });
};

export const mockUpdateApplicationStatus = async (applicationId: string, payload: Record<string, any>) => {
  const { db } = requireUser('employer');
  const app = db.applications.find((item) => item.id === applicationId);
  if (!app) {
    throwMockError('Application not found');
  }
  app.status = payload.status || app.status;
  app.updated_at = now();
  addNotification(db, app.worker_id, 'Application Update', `Your application status is now ${app.status}.`);
  saveDb(db);
  return app;
};

export const mockGetNotifications = async () => {
  const { db, user } = requireUser();
  return db.notifications.filter((item) => item.user_id === user.id);
};

export const mockMarkNotificationRead = async (notificationId: string) => {
  const { db } = requireUser();
  const notification = db.notifications.find((item) => item.id === notificationId);
  if (notification) {
    notification.is_read = true;
  }
  saveDb(db);
  return { success: true };
};

export const mockMarkAllNotificationsRead = async () => {
  const { db, user } = requireUser();
  db.notifications
    .filter((item) => item.user_id === user.id)
    .forEach((item) => {
      item.is_read = true;
    });
  saveDb(db);
  return { success: true };
};

export const mockGetAdminDashboard = async () => {
  const { db } = requireUser('admin');
  const totalEmployers = db.users.filter((item) => item.role === 'employer').length;
  const totalWorkers = db.users.filter((item) => item.role === 'worker').length;
  const totalJobs = db.jobs.length;
  const totalApplications = db.applications.length;
  return {
    totalEmployers,
    totalWorkers,
    totalJobs,
    totalApplications,
  };
};

export const mockGetPendingVerifications = async () => {
  const { db } = requireUser('admin');
  const workers = db.worker_profiles
    .filter((profile) => profile.verification_status === 'pending')
    .map((profile) => ({
      user_id: profile.user_id,
      full_name: profile.full_name,
      city: profile.city,
    }));
  const employers = db.employer_profiles
    .filter((profile) => profile.verification_status === 'pending')
    .map((profile) => ({
      user_id: profile.user_id,
      business_name: profile.business_name,
      city: profile.city,
    }));
  return { workers, employers };
};

export const mockVerifyWorker = async (userId: string, payload: Record<string, any>) => {
  const { db } = requireUser('admin');
  const profile = db.worker_profiles.find((item) => item.user_id === userId);
  const user = db.users.find((item) => item.id === userId);
  if (!profile || !user) {
    throwMockError('Worker not found');
  }
  profile.verification_status = payload.status || profile.verification_status;
  user.verification_status = profile.verification_status;
  addNotification(db, userId, 'Verification अपडेट', `आपका प्रोफाइल ${profile.verification_status} किया गया है।`);
  saveDb(db);
  return { success: true };
};

export const mockVerifyEmployer = async (userId: string, payload: Record<string, any>) => {
  const { db } = requireUser('admin');
  const profile = db.employer_profiles.find((item) => item.user_id === userId);
  const user = db.users.find((item) => item.id === userId);
  if (!profile || !user) {
    throwMockError('Employer not found');
  }
  profile.verification_status = payload.status || profile.verification_status;
  user.verification_status = profile.verification_status;
  addNotification(db, userId, 'Verification अपडेट', `आपका प्रोफाइल ${profile.verification_status} किया गया है।`);
  saveDb(db);
  return { success: true };
};

export const mockGetPendingJobs = async () => {
  const { db } = requireUser('admin');
  return db.jobs.filter((job) => job.status === 'pending');
};

export const mockApproveJob = async (jobId: string) => {
  const { db } = requireUser('admin');
  const job = db.jobs.find((item) => item.id === jobId);
  if (!job) {
    throwMockError('Job not found');
  }
  job.status = 'active';
  job.verification_status = 'approved';
  job.updated_at = now();
  addNotification(db, job.employer_id, 'Job Approved', `Your job "${job.title}" is now live.`);
  saveDb(db);
  return { success: true };
};

export const mockRejectJob = async (jobId: string) => {
  const { db } = requireUser('admin');
  const job = db.jobs.find((item) => item.id === jobId);
  if (!job) {
    throwMockError('Job not found');
  }
  job.status = 'rejected';
  job.verification_status = 'rejected';
  job.updated_at = now();
  addNotification(db, job.employer_id, 'Job Rejected', `Your job "${job.title}" was rejected.`);
  saveDb(db);
  return { success: true };
};

export const MOCK_ADMIN_PASSWORD = ADMIN_PASSWORD;
export const MOCK_OTP_CODE = MOCK_OTP;
