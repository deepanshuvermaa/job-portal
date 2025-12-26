import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../utils/translations';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { FileUpload } from '../components/shared/FileUpload';
import { VoiceRecorder } from '../components/shared/VoiceRecorder';
import { UserCircle, FileText } from 'lucide-react';
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, AVAILABILITY_OPTIONS, LANGUAGES } from '../utils/constants';
import { processResume } from '../utils/ocr';
import type { ExtractedResumeData } from '../utils/ocr';
import { registerWorker, loadCurrentUser } from '../services/auth';
import { uploadWorkerDocument } from '../services/uploads';
import { updateSEO, SEO_PRESETS } from '../utils/seo';

const workerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  experience: z.string().min(1, 'Please select experience level'),
  availability: z.array(z.string()).min(1, 'Select at least one availability option'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  locality: z.string().min(2, 'Locality is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

type WorkerFormData = z.infer<typeof workerSchema>;

export const WorkerSignup: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { login, pendingPhone, setPendingPhone, setToken } = useAuthStore();
  const { t } = useTranslation(language);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    updateSEO(SEO_PRESETS.worker(language));
  }, [language]);

  useEffect(() => {
    if (!pendingPhone) {
      navigate('/auth/phone');
    }
  }, [pendingPhone, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      skills: [],
      availability: [],
      languages: [],
    },
  });

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill].slice(0, 3);

    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleAvailabilityToggle = (avail: string) => {
    const newAvailability = selectedAvailability.includes(avail)
      ? selectedAvailability.filter((a) => a !== avail)
      : [...selectedAvailability, avail];

    setSelectedAvailability(newAvailability);
    setValue('availability', newAvailability);
  };

  const handleLanguageToggle = (lang: string) => {
    const newLanguages = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];

    setSelectedLanguages(newLanguages);
    setValue('languages', newLanguages);
  };

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setUploadingResume(true);

    try {
      const data = await processResume(file);
      setExtractedData(data);

      if (data.name) setValue('name', data.name);
      if (data.skills && data.skills.length > 0) {
        const matchedSkills = data.skills.slice(0, 3);
        setSelectedSkills(matchedSkills);
        setValue('skills', matchedSkills);
      }
    } catch (err) {
      setError('Could not extract text from resume. Please fill manually.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleVoiceRecording = (_blob: Blob, _url: string) => {};

  const onSubmit = async (data: WorkerFormData) => {
    if (!pendingPhone) {
      navigate('/auth/phone');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await registerWorker({
        phone: pendingPhone,
        password: data.password,
        full_name: data.name,
        address: `${data.area}, ${data.locality}`,
        city: data.city,
        skills: data.skills,
        experience_years: data.experience === 'fresher' ? 0 : data.experience === '1-2' ? 1 : data.experience === '3-5' ? 3 : 5,
        preferred_job_types: data.availability,
        preferred_locations: [data.city],
      });

      if (response?.tokens?.accessToken) {
        setToken(response.tokens.accessToken, response.tokens.refreshToken);
      }

      const currentUser = await loadCurrentUser();
      login(currentUser, response.tokens.accessToken, response.tokens.refreshToken);
      setPendingPhone(null);

      if (resumeFile) {
        await uploadWorkerDocument('resume', resumeFile);
      }

      navigate('/worker/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to register worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('worker.profile')}
            </h1>
            <p className="text-gray-600">
              {language === 'hi'
                ? 'अपनी जानकारी भरें'
                : 'Enter your information'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {language === 'hi' ? 'रिज्यूमे अपलोड करें (वैकल्पिक)' : 'Upload Resume (Optional)'}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {language === 'hi'
                      ? 'हम आपके रिज्यूमे से फॉर्म स्वतः भर देंगे'
                      : 'We will auto-fill the form from your resume'}
                  </p>
                </div>
              </div>

              <FileUpload
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                onFileSelect={handleResumeUpload}
                loading={uploadingResume}
              />

              {extractedData && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-300">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {language === 'hi' ? 'निकाली गई जानकारी:' : 'Extracted Information:'}
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {extractedData.name && <li>- Name: {extractedData.name}</li>}
                    {extractedData.phone && <li>- Phone: {extractedData.phone}</li>}
                    {extractedData.email && <li>- Email: {extractedData.email}</li>}
                    {extractedData.experience && <li>- Experience: {extractedData.experience}</li>}
                    {extractedData.skills && extractedData.skills.length > 0 && (
                      <li>- Skills: {extractedData.skills.join(', ')}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <Input
              label={language === 'hi' ? 'नाम' : 'Name'}
              placeholder={language === 'hi' ? 'अपना नाम लिखें' : 'Enter your name'}
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('worker.selectSkills')} <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">{t('worker.skillsHelp')}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleSkillToggle(cat.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedSkills.includes(cat.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                    disabled={selectedSkills.length >= 3 && !selectedSkills.includes(cat.value)}
                  >
                    {language === 'hi' ? cat.labelHi : cat.label}
                  </button>
                ))}
              </div>

              {errors.skills && (
                <p className="mt-2 text-sm text-red-600">{errors.skills.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('worker.experience')} <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <label
                    key={exp.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      watch('experience') === exp.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={exp.value}
                      {...register('experience')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {language === 'hi' ? exp.labelHi : exp.label}
                    </span>
                  </label>
                ))}
              </div>

              {errors.experience && (
                <p className="mt-2 text-sm text-red-600">{errors.experience.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('worker.availability')} <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {AVAILABILITY_OPTIONS.map((avail) => (
                  <button
                    key={avail.value}
                    type="button"
                    onClick={() => handleAvailabilityToggle(avail.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedAvailability.includes(avail.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {language === 'hi' ? avail.labelHi : avail.label}
                  </button>
                ))}
              </div>

              {errors.availability && (
                <p className="mt-2 text-sm text-red-600">{errors.availability.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('worker.languages')} <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedLanguages.includes(lang.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {language === 'hi' ? lang.labelHi : lang.label}
                  </button>
                ))}
              </div>

              {errors.languages && (
                <p className="mt-2 text-sm text-red-600">{errors.languages.message}</p>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('employer.location')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={language === 'hi' ? 'शहर' : 'City'}
                  {...register('city')}
                  error={errors.city?.message}
                  required
                />
                <Input
                  label={language === 'hi' ? 'एरिया' : 'Area'}
                  {...register('area')}
                  error={errors.area?.message}
                  required
                />
                <Input
                  label={language === 'hi' ? 'लोकैलिटी' : 'Locality'}
                  {...register('locality')}
                  error={errors.locality?.message}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <VoiceRecorder
                label={t('worker.voiceIntro')}
                maxDuration={30}
                onRecordingComplete={handleVoiceRecording}
                helperText={language === 'hi'
                  ? '30 सेकंड में अपना परिचय दें (वैकल्पिक)'
                  : 'Introduce yourself in 30 seconds (optional)'}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'hi' ? 'पासवर्ड सेट करें' : 'Set Password'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  label={language === 'hi' ? 'पासवर्ड' : 'Password'}
                  {...register('password')}
                  error={errors.password?.message}
                  required
                />
                <Input
                  type="password"
                  label={language === 'hi' ? 'पासवर्ड पुष्टि' : 'Confirm Password'}
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
            >
              {submitting ? t('common.loading') : t('common.submit')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
