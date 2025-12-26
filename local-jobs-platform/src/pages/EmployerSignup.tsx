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
import { Select } from '../components/shared/Select';
import { Card } from '../components/shared/Card';
import { FileUpload } from '../components/shared/FileUpload';
import { Building2, MapPin, FileText } from 'lucide-react';
import { BUSINESS_TYPES } from '../utils/constants';
import { validateGST, validatePAN } from '../utils/documentValidation';
import { registerEmployer, loadCurrentUser } from '../services/auth';
import { uploadEmployerDocument } from '../services/uploads';
import { updateSEO, SEO_PRESETS } from '../utils/seo';

const employerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select business type'),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  locality: z.string().min(2, 'Locality is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
).refine(
  (data) => {
    if (data.gstNumber && data.gstNumber.length > 0) {
      return validateGST(data.gstNumber).isValid;
    }
    return true;
  },
  { message: 'Invalid GST number', path: ['gstNumber'] }
).refine(
  (data) => {
    if (data.panNumber && data.panNumber.length > 0) {
      return validatePAN(data.panNumber).isValid;
    }
    return true;
  },
  { message: 'Invalid PAN number', path: ['panNumber'] }
);

type EmployerFormData = z.infer<typeof employerSchema>;

export const EmployerSignup: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { login, pendingPhone, setPendingPhone, setToken } = useAuthStore();
  const { t } = useTranslation(language);

  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null);
  const [businessProofUrl, setBusinessProofUrl] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    updateSEO(SEO_PRESETS.employer(language));
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
  } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      businessType: '',
    },
  });

  const businessTypeOptions = BUSINESS_TYPES.map((bt) => ({
    value: bt.value,
    label: language === 'hi' ? bt.labelHi : bt.label,
  }));

  const handleProofUpload = async (file: File) => {
    setBusinessProofFile(file);
    setUploadingProof(true);

    const mockUrl = URL.createObjectURL(file);
    setBusinessProofUrl(mockUrl);
    setUploadingProof(false);
  };

  const onSubmit = async (data: EmployerFormData) => {
    if (!pendingPhone) {
      navigate('/auth/phone');
      return;
    }

    if (!businessProofFile) {
      setError('Business proof document is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const mappedBusinessType = data.businessType === 'contractor'
      ? 'contractor'
      : data.businessType === 'other'
        ? 'other'
        : 'company';

    try {
      const response = await registerEmployer({
        phone: pendingPhone,
        password: data.password,
        business_name: data.businessName,
        business_type: mappedBusinessType,
        industry: data.businessType,
        address: `${data.address}, ${data.area}, ${data.locality}`,
        city: data.city,
        pincode: data.pincode,
        gst_number: data.gstNumber || null,
        pan_number: data.panNumber || null,
      });

      if (response?.tokens?.accessToken) {
        setToken(response.tokens.accessToken, response.tokens.refreshToken);
      }

      const currentUser = await loadCurrentUser();
      login(currentUser, response.tokens.accessToken, response.tokens.refreshToken);
      setPendingPhone(null);

      if (businessProofFile) {
        await uploadEmployerDocument('business_license', businessProofFile);
      }

      navigate('/employer/verification-pending');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to register employer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('employer.businessType')}
            </h1>
            <p className="text-gray-600">
              {language === 'hi'
                ? 'एंटर करें अपना बिजनेस विवरण'
                : 'Enter your business information'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Select
              label={t('employer.businessType')}
              options={businessTypeOptions}
              placeholder={language === 'hi' ? 'चुनें' : 'Select'}
              {...register('businessType')}
              error={errors.businessType?.message}
              required
            />

            <Input
              label={t('employer.businessName')}
              placeholder={language === 'hi' ? 'बिजनेस का नाम' : 'Enter your business name'}
              {...register('businessName')}
              error={errors.businessName?.message}
              required
            />

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {t('employer.location')}
              </h3>

              <div className="space-y-4">
                <Input
                  label={language === 'hi' ? 'पता' : 'Address'}
                  placeholder={language === 'hi' ? 'दुकान/ऑफिस पता' : 'Shop/Office address'}
                  {...register('address')}
                  error={errors.address?.message}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={language === 'hi' ? 'शहर' : 'City'}
                    placeholder={language === 'hi' ? 'शहर' : 'City'}
                    {...register('city')}
                    error={errors.city?.message}
                    required
                  />

                  <Input
                    label={language === 'hi' ? 'एरिया' : 'Area'}
                    placeholder={language === 'hi' ? 'एरिया' : 'Area'}
                    {...register('area')}
                    error={errors.area?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={language === 'hi' ? 'लोकैलिटी' : 'Locality'}
                    placeholder={language === 'hi' ? 'लोकैलिटी' : 'Locality'}
                    {...register('locality')}
                    error={errors.locality?.message}
                    required
                  />

                  <Input
                    label={language === 'hi' ? 'पिनकोड' : 'Pincode'}
                    placeholder="400001"
                    {...register('pincode')}
                    error={errors.pincode?.message}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                {language === 'hi' ? 'डॉक्यूमेंट्स' : 'Documents'}
              </h3>

              <div className="space-y-4">
                <Input
                  label="GST Number"
                  placeholder="22AAAAA0000A1Z5"
                  {...register('gstNumber')}
                  error={errors.gstNumber?.message}
                  helperText={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                />

                <Input
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                  {...register('panNumber')}
                  error={errors.panNumber?.message}
                  helperText={language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                />

                <FileUpload
                  label={t('employer.uploadProof')}
                  helperText={t('employer.proofHelp')}
                  accept="image/*,.pdf"
                  maxSize={2 * 1024 * 1024}
                  onFileSelect={handleProofUpload}
                  onFileRemove={() => {
                    setBusinessProofFile(null);
                    setBusinessProofUrl('');
                  }}
                  uploadedUrl={businessProofUrl}
                  loading={uploadingProof}
                />
              </div>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{language === 'hi' ? 'नोट:' : 'Note:'}</strong>{' '}
                {language === 'hi'
                  ? 'वेरिफिकेशन में 15-60 मिनट लग सकते हैं.'
                  : 'Verification usually takes 15-60 minutes.'}
              </p>
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




