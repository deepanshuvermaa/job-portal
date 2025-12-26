import axios from 'axios';
import { config } from '../config/env';

export class SMSService {
  /**
   * Send OTP via MSG91 (India)
   */
  static async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      const url = `https://control.msg91.com/api/v5/otp`;

      const response = await axios.post(
        url,
        {
          template_id: config.MSG91_TEMPLATE_ID,
          mobile: `91${phone}`,
          authkey: config.MSG91_AUTH_KEY,
          otp: otp,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('SMS sent successfully:', response.data);
      return true;
    } catch (error: any) {
      console.error('SMS Error:', error.response?.data || error.message);
      // Return true in development to allow testing without SMS
      if (config.NODE_ENV === 'development') {
        console.log(`[DEV MODE] OTP: ${otp} for phone: ${phone}`);
        return true;
      }
      return false;
    }
  }

  /**
   * Send custom SMS message
   */
  static async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      const url = `https://control.msg91.com/api/sendhttp.php`;

      const response = await axios.get(url, {
        params: {
          authkey: config.MSG91_AUTH_KEY,
          mobiles: `91${phone}`,
          message: message,
          sender: config.MSG91_SENDER_ID,
          route: '4', // Transactional route
        },
      });

      console.log('SMS sent successfully:', response.data);
      return true;
    } catch (error: any) {
      console.error('SMS Error:', error.response?.data || error.message);
      if (config.NODE_ENV === 'development') {
        console.log(`[DEV MODE] SMS to ${phone}: ${message}`);
        return true;
      }
      return false;
    }
  }
}

export default SMSService;
