import { api } from './api';

export const generateReferralCode = async () => {
  const { data } = await api.post('/api/referrals/generate-code');
  return data.data.referralCode;
};

export const applyReferralCode = async (referralCode: string, referredId: string) => {
  const { data } = await api.post('/api/referrals/apply', {
    referral_code: referralCode,
    referred_id: referredId
  });
  return data.data;
};

export const getMyReferrals = async () => {
  const { data } = await api.get('/api/referrals/my');
  return data.data;
};
