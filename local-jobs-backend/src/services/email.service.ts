import axios from 'axios';
import { config } from '../config/env';

export class EmailService {
  /**
   * Send email via Brevo/SendinBlue API
   */
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            email: config.EMAIL_FROM,
            name: 'Job Platform',
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent,
          textContent: textContent || subject,
        },
        {
          headers: {
            'api-key': config.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Email sent successfully:', response.data);
      return true;
    } catch (error: any) {
      console.error('Email Error:', error.response?.data || error.message);

      // In development mode, log email instead of failing
      if (config.NODE_ENV === 'development') {
        console.log(`
          [DEV MODE] Email would be sent:
          To: ${to}
          Subject: ${subject}
          Content: ${htmlContent}
        `);
        return true;
      }

      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: 'worker' | 'employer'
  ): Promise<boolean> {
    const roleText = role === 'worker' ? 'job seeker' : 'employer';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Job Platform!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining our hyperlocal job marketplace as a ${roleText}!</p>

            ${role === 'worker'
              ? `<p>Start exploring verified jobs in your city now. Your profile is currently pending verification. We'll notify you once it's approved.</p>`
              : `<p>You can now start posting jobs to connect with verified local workers in your area. Your profile is currently pending verification.</p>`
            }

            <p>What's next?</p>
            <ul>
              <li>Complete your profile with all required documents</li>
              <li>Wait for admin verification (usually within 24 hours)</li>
              <li>${role === 'worker' ? 'Browse and apply to jobs' : 'Post your first job opening'}</li>
            </ul>

            <a href="${config.FRONTEND_URL}" class="button">Get Started</a>

            <p>If you have any questions, feel free to reach out to our support team.</p>

            <p>Best regards,<br>Job Platform Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>&copy; 2024 Job Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Welcome to Job Platform!', html);
  }

  /**
   * Send profile verification approval email
   */
  static async sendVerificationApprovedEmail(
    email: string,
    name: string,
    role: 'worker' | 'employer'
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✓</div>
            <h1>Profile Verified!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${name}!</h2>
            <p>Your profile has been successfully verified and approved by our team.</p>

            ${role === 'worker'
              ? `<p>You can now:</p>
                 <ul>
                   <li>Apply to unlimited job postings</li>
                   <li>Connect directly with verified employers</li>
                   <li>Receive job notifications in your area</li>
                   <li>Build your professional profile</li>
                 </ul>`
              : `<p>You can now:</p>
                 <ul>
                   <li>Post unlimited job openings</li>
                   <li>Access verified worker profiles</li>
                   <li>Review applications instantly</li>
                   <li>Connect with quality candidates</li>
                 </ul>`
            }

            <a href="${config.FRONTEND_URL}" class="button">Start Now</a>

            <p>Thank you for being part of our community!</p>

            <p>Best regards,<br>Job Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, '✓ Your Profile Has Been Verified!', html);
  }

  /**
   * Send profile verification rejection email
   */
  static async sendVerificationRejectedEmail(
    email: string,
    name: string,
    reason: string,
    role: 'worker' | 'employer'
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Profile Verification Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for your interest in joining Job Platform. Unfortunately, we couldn't verify your profile at this time.</p>

            <div class="reason-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>

            <p>What you can do:</p>
            <ul>
              <li>Review the reason mentioned above</li>
              <li>Update your profile with correct information</li>
              <li>Re-upload required documents (clear, readable copies)</li>
              <li>Contact support if you need assistance</li>
            </ul>

            <p>You can update your profile and request verification again.</p>

            <a href="${config.FRONTEND_URL}" class="button">Update Profile</a>

            <p>If you believe this is an error, please contact our support team.</p>

            <p>Best regards,<br>Job Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Profile Verification Update', html);
  }

  /**
   * Send application status update email to worker
   */
  static async sendApplicationStatusEmail(
    email: string,
    workerName: string,
    jobTitle: string,
    companyName: string,
    status: 'shortlisted' | 'rejected' | 'hired',
    interviewDetails?: { date?: string; location?: string; }
  ): Promise<boolean> {
    let statusColor = '#3b82f6';
    let statusText = 'Application Update';
    let message = '';

    switch (status) {
      case 'shortlisted':
        statusColor = '#3b82f6';
        statusText = 'You have Been Shortlisted!';
        message = `Great news! ${companyName} has shortlisted your application for the ${jobTitle} position.`;
        break;
      case 'hired':
        statusColor = '#10b981';
        statusText = 'Congratulations! You are Hired!';
        message = `Excellent news! ${companyName} has selected you for the ${jobTitle} position.`;
        break;
      case 'rejected':
        statusColor = '#ef4444';
        statusText = 'Application Update';
        message = `Thank you for your interest in the ${jobTitle} position at ${companyName}. Unfortunately, they have decided to move forward with other candidates.`;
        break;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
          .button { display: inline-block; padding: 12px 30px; background: ${statusColor}; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusText}</h1>
          </div>
          <div class="content">
            <h2>Hi ${workerName},</h2>
            <p>${message}</p>

            <div class="job-details">
              <strong>Job Position:</strong> ${jobTitle}<br>
              <strong>Company:</strong> ${companyName}
              ${interviewDetails?.date ? `<br><strong>Interview Date:</strong> ${interviewDetails.date}` : ''}
              ${interviewDetails?.location ? `<br><strong>Location:</strong> ${interviewDetails.location}` : ''}
            </div>

            ${status === 'shortlisted'
              ? `<p>The employer will contact you soon with further details. Please keep your phone handy.</p>`
              : status === 'hired'
              ? `<p>The employer will contact you with joining details. Congratulations on your new role!</p>`
              : `<p>Don't be discouraged! Keep applying to more opportunities. Your perfect job is waiting for you.</p>`
            }

            <a href="${config.FRONTEND_URL}/worker/applications" class="button">View Application</a>

            <p>Best of luck!</p>
            <p>Job Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, statusText, html);
  }

  /**
   * Send new application notification to employer
   */
  static async sendNewApplicationEmail(
    email: string,
    employerName: string,
    workerName: string,
    jobTitle: string,
    applicationId: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .application-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Application Received!</h1>
          </div>
          <div class="content">
            <h2>Hi ${employerName},</h2>
            <p>You have received a new application for your job posting.</p>

            <div class="application-box">
              <strong>Applicant:</strong> ${workerName}<br>
              <strong>Job Position:</strong> ${jobTitle}<br>
              <strong>Applied On:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>

            <p>Review the candidate's profile and take action:</p>
            <ul>
              <li>View complete profile and documents</li>
              <li>Shortlist for interview</li>
              <li>Contact directly via phone</li>
            </ul>

            <a href="${config.FRONTEND_URL}/employer/applications" class="button">View Application</a>

            <p>Quick response increases your chances of hiring quality candidates!</p>

            <p>Best regards,<br>Job Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, `New Application from ${workerName}`, html);
  }

  /**
   * Send OTP email as backup (if SMS fails)
   */
  static async sendOTPEmail(
    email: string,
    otp: string,
    purpose: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; }
          .container { max-width: 600px; margin: 50px auto; padding: 40px; }
          .otp-box { background: #f3f4f6; border: 2px dashed #8b5cf6; padding: 30px; margin: 30px 0; border-radius: 10px; }
          .otp { font-size: 36px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px; }
          .warning { color: #ef4444; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Your Verification Code</h1>
          <p>Your OTP for ${purpose}:</p>

          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>

          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>

          <div class="warning">
            ⚠️ Never share this code with anyone. Job Platform will never ask for your OTP.
          </div>

          <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
            Job Platform Team
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, `Your OTP: ${otp}`, html);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>We received a request to reset your password.</p>
            <p>Click the button below to create a new password:</p>

            <a href="${resetLink}" class="button">Reset Password</a>

            <div class="warning">
              ⚠️ This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </div>

            <p>Or copy this link: <br><code>${resetLink}</code></p>

            <p>Best regards,<br>Job Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Reset Your Password', html);
  }
}

export default EmailService;
