import { supabase } from '../config/supabase';
import { Notification } from '../types';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';

export class NotificationService {
  /**
   * Create notification in database
   */
  static async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: any
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link,
          metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Notification creation error:', error);
        return null;
      }

      console.log(`✓ Notification created for user ${userId}: ${title}`);
      return data;
    } catch (error) {
      console.error('Notification creation error:', error);
      return null;
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return !error;
    } catch (error) {
      console.error('Mark all as read error:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async delete(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // ========================
  // SPECIFIC NOTIFICATIONS
  // ========================

  /**
   * Send welcome notification to new user
   */
  static async sendWelcomeNotification(
    userId: string,
    userName: string,
    role: 'worker' | 'employer',
    email?: string
  ): Promise<void> {
    const message = role === 'worker'
      ? 'Welcome to Job Platform! Complete your profile to start applying for jobs.'
      : 'Welcome to Job Platform! Start posting jobs to connect with verified workers.';

    await this.create(
      userId,
      'welcome',
      `Welcome ${userName}!`,
      message,
      `/${role}/profile`
    );

    // Send welcome email if email provided
    if (email) {
      await EmailService.sendWelcomeEmail(email, userName, role);
    }
  }

  /**
   * Notify when profile verification status changes
   */
  static async sendVerificationStatusNotification(
    userId: string,
    userName: string,
    status: 'approved' | 'rejected',
    role: 'worker' | 'employer',
    rejectionReason?: string,
    email?: string
  ): Promise<void> {
    if (status === 'approved') {
      await this.create(
        userId,
        'profile_verified',
        '✓ Profile Verified!',
        `Congratulations! Your profile has been verified. You can now ${role === 'worker' ? 'apply to jobs' : 'post jobs'}.`,
        `/${role}/profile`
      );

      if (email) {
        await EmailService.sendVerificationApprovedEmail(email, userName, role);
      }
    } else {
      await this.create(
        userId,
        'profile_rejected',
        'Profile Verification Update',
        `Your profile verification was not approved. Reason: ${rejectionReason || 'Please review your documents.'}`,
        `/${role}/profile`
      );

      if (email) {
        await EmailService.sendVerificationRejectedEmail(
          email,
          userName,
          rejectionReason || 'Please review and update your documents',
          role
        );
      }
    }
  }

  /**
   * Notify worker when application status changes
   */
  static async sendApplicationStatusNotification(
    workerId: string,
    workerName: string,
    jobTitle: string,
    companyName: string,
    status: 'shortlisted' | 'rejected' | 'hired',
    workerEmail?: string,
    interviewDetails?: { date?: string; location?: string; }
  ): Promise<void> {
    let title = '';
    let message = '';
    let icon = '';

    switch (status) {
      case 'shortlisted':
        icon = '⭐';
        title = "You have been shortlisted!";
        message = `${companyName} has shortlisted you for ${jobTitle}. They will contact you soon.`;
        break;
      case 'hired':
        icon = '🎉';
        title = 'Congratulations! You are hired!';
        message = `${companyName} has selected you for ${jobTitle}. They will contact you with joining details.`;
        break;
      case 'rejected':
        icon = '📋';
        title = 'Application Update';
        message = `Your application for ${jobTitle} at ${companyName} was not selected. Keep applying!`;
        break;
    }

    await this.create(
      workerId,
      `application_${status}`,
      `${icon} ${title}`,
      message,
      '/worker/applications',
      {
        jobTitle,
        companyName,
        status,
        interviewDetails
      }
    );

    // Send email notification
    if (workerEmail) {
      await EmailService.sendApplicationStatusEmail(
        workerEmail,
        workerName,
        jobTitle,
        companyName,
        status,
        interviewDetails
      );
    }
  }

  /**
   * Notify employer of new application
   */
  static async sendNewApplicationNotification(
    employerId: string,
    employerName: string,
    workerName: string,
    jobTitle: string,
    applicationId: string,
    employerEmail?: string,
    employerPhone?: string
  ): Promise<void> {
    await this.create(
      employerId,
      'new_application',
      '📩 New Application Received',
      `${workerName} has applied for your ${jobTitle} position. Review now!`,
      `/employer/applications`,
      {
        workerName,
        jobTitle,
        applicationId
      }
    );

    // Send email notification
    if (employerEmail) {
      await EmailService.sendNewApplicationEmail(
        employerEmail,
        employerName,
        workerName,
        jobTitle,
        applicationId
      );
    }

    // Send SMS notification (optional)
    if (employerPhone) {
      await SMSService.sendSMS(
        employerPhone,
        `New application from ${workerName} for ${jobTitle}. Login to review: ${process.env.FRONTEND_URL}`
      );
    }
  }

  /**
   * Notify worker of new job matching their profile
   */
  static async sendJobMatchNotification(
    workerId: string,
    jobTitle: string,
    companyName: string,
    location: string,
    salary: string,
    jobId: string
  ): Promise<void> {
    await this.create(
      workerId,
      'job_match',
      '💼 New Job Match!',
      `${jobTitle} at ${companyName} in ${location}. Salary: ${salary}. Apply now!`,
      `/worker/jobs/${jobId}`,
      {
        jobTitle,
        companyName,
        location,
        salary,
        jobId
      }
    );
  }

  /**
   * Notify employer when job is about to expire
   */
  static async sendJobExpiryNotification(
    employerId: string,
    jobTitle: string,
    jobId: string,
    daysLeft: number
  ): Promise<void> {
    await this.create(
      employerId,
      'job_expiring',
      '⏰ Job Posting Expiring Soon',
      `Your job posting "${jobTitle}" will expire in ${daysLeft} days. Renew now to keep receiving applications.`,
      `/employer/jobs/${jobId}`,
      {
        jobTitle,
        jobId,
        daysLeft
      }
    );
  }

  /**
   * Notify when profile documents need update
   */
  static async sendDocumentUpdateNotification(
    userId: string,
    role: 'worker' | 'employer',
    documentType: string
  ): Promise<void> {
    await this.create(
      userId,
      'document_update_required',
      '📄 Document Update Required',
      `Please update your ${documentType}. Your profile verification may be affected.`,
      `/${role}/profile`
    );
  }

  /**
   * Notify admin of new registration pending verification
   */
  static async sendAdminVerificationNotification(
    adminIds: string[],
    userName: string,
    role: 'worker' | 'employer',
    userId: string
  ): Promise<void> {
    for (const adminId of adminIds) {
      await this.create(
        adminId,
        'pending_verification',
        '🔔 New Verification Pending',
        `${userName} (${role}) has registered and is pending verification.`,
        `/admin/verifications`,
        {
          userName,
          role,
          userId
        }
      );
    }
  }

  /**
   * Send interview reminder to worker
   */
  static async sendInterviewReminderNotification(
    workerId: string,
    jobTitle: string,
    companyName: string,
    interviewDate: string,
    interviewLocation: string,
    workerPhone?: string
  ): Promise<void> {
    await this.create(
      workerId,
      'interview_reminder',
      '📅 Interview Reminder',
      `Reminder: Interview for ${jobTitle} at ${companyName} on ${interviewDate}. Location: ${interviewLocation}`,
      '/worker/applications'
    );

    // Send SMS reminder
    if (workerPhone) {
      await SMSService.sendSMS(
        workerPhone,
        `Interview reminder: ${jobTitle} at ${companyName} on ${interviewDate}. Location: ${interviewLocation}. All the best!`
      );
    }
  }

  /**
   * Notify worker of new review received
   */
  static async sendReviewNotification(
    userId: string,
    reviewerName: string,
    rating: number,
    role: 'worker' | 'employer'
  ): Promise<void> {
    const stars = '⭐'.repeat(rating);

    await this.create(
      userId,
      'new_review',
      '⭐ New Review Received',
      `${reviewerName} rated you ${stars} (${rating}/5). Check your profile to see the feedback!`,
      `/${role}/profile`
    );
  }

  /**
   * Send bulk notification to multiple users
   */
  static async sendBulkNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        title,
        message,
        link,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      console.log(`✓ Sent bulk notification to ${userIds.length} users`);
    } catch (error) {
      console.error('Bulk notification error:', error);
    }
  }

  /**
   * Send system announcement to all users
   */
  static async sendSystemAnnouncement(
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    try {
      // Get all active users
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true);

      if (!users || users.length === 0) return;

      const userIds = users.map(u => u.id);
      await this.sendBulkNotification(userIds, 'system_announcement', title, message, link);

      console.log(`✓ System announcement sent to ${userIds.length} users`);
    } catch (error) {
      console.error('System announcement error:', error);
    }
  }
}

export default NotificationService;
