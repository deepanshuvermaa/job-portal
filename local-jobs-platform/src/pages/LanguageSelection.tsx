import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Languages } from 'lucide-react';
import { updateSEO, SEO_PRESETS } from '../utils/seo';

export const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage, language } = useAppStore();

  useEffect(() => {
    updateSEO(SEO_PRESETS.home(language));
  }, [language]);

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    navigate('/auth/phone');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Languages className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LocalJobs</h1>
          <p className="text-gray-600">Find local jobs near you</p>
          <p className="text-gray-600 text-sm">अपना काम अपने घर के पास</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">
            Choose Language / भाषा चुनें
          </h2>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => handleLanguageSelect('hi')}
          >
            <span className="text-xl">हिंदी</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleLanguageSelect('en')}
          >
            <span className="text-xl">English</span>
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Connecting local workers with local jobs</p>
          <p className="text-xs mt-2">स्थानीय कामगारों को स्थानीय नौकरियों से जोड़ते हैं</p>
        </div>
      </Card>
    </div>
  );
};
