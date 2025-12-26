import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, MapPin, TrendingUp, Shield, Clock,
  CheckCircle, Star, Search, ArrowRight, Menu, X,
  Zap, Target, Award, Globe
} from 'lucide-react';
import { Button } from '../components/shared/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const content = {
    en: {
      nav: {
        features: 'Features',
        howItWorks: 'How It Works',
        about: 'About',
        login: 'Login',
        getStarted: 'Get Started'
      },
      hero: {
        title: 'Find Local Jobs Near You',
        subtitle: 'Connect with trusted employers in your area. Quick, simple, and secure.',
        ctaPrimary: 'Find Jobs Now',
        ctaSecondary: 'Post a Job',
        stats: {
          jobs: 'Active Jobs',
          workers: 'Verified Workers',
          employers: 'Trusted Employers'
        }
      },
      features: {
        title: 'Why Choose LocalJobs',
        subtitle: 'Everything you need to find or hire local talent',
        items: [
          {
            icon: MapPin,
            title: 'Hyperlocal Matching',
            description: 'Find jobs and workers in your exact neighborhood'
          },
          {
            icon: Shield,
            title: 'Verified Profiles',
            description: 'All users verified with Aadhaar and documents'
          },
          {
            icon: Zap,
            title: 'Instant Connections',
            description: 'Apply and hire within minutes, not days'
          },
          {
            icon: Clock,
            title: '24/7 Support',
            description: 'Get help whenever you need it'
          },
          {
            icon: Target,
            title: 'Smart Matching',
            description: 'AI-powered job recommendations'
          },
          {
            icon: Award,
            title: 'Quality Assured',
            description: 'Ratings and reviews for transparency'
          }
        ]
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Get started in 3 simple steps',
        worker: {
          title: 'For Job Seekers',
          steps: [
            {
              number: '01',
              title: 'Create Profile',
              description: 'Sign up with your phone and upload documents'
            },
            {
              number: '02',
              title: 'Browse Jobs',
              description: 'Find local jobs matching your skills'
            },
            {
              number: '03',
              title: 'Get Hired',
              description: 'Apply and connect with employers instantly'
            }
          ]
        },
        employer: {
          title: 'For Employers',
          steps: [
            {
              number: '01',
              title: 'Post Job',
              description: 'Create detailed job listings in minutes'
            },
            {
              number: '02',
              title: 'Review Candidates',
              description: 'See verified worker profiles and applications'
            },
            {
              number: '03',
              title: 'Hire Fast',
              description: 'Connect directly and hire the best talent'
            }
          ]
        }
      },
      cta: {
        title: 'Ready to Get Started?',
        subtitle: 'Join thousands of workers and employers already using LocalJobs',
        button: 'Start Now - It\'s Free'
      },
      footer: {
        tagline: 'Connecting local workers with local jobs',
        copyright: '© 2024 LocalJobs. All rights reserved.'
      }
    },
    hi: {
      nav: {
        features: 'विशेषताएं',
        howItWorks: 'कैसे काम करता है',
        about: 'हमारे बारे में',
        login: 'लॉगिन',
        getStarted: 'शुरू करें'
      },
      hero: {
        title: 'अपने पास नौकरी खोजें',
        subtitle: 'अपने क्षेत्र में विश्वसनीय नियोक्ताओं से जुड़ें। त्वरित, सरल और सुरक्षित।',
        ctaPrimary: 'नौकरी खोजें',
        ctaSecondary: 'नौकरी पोस्ट करें',
        stats: {
          jobs: 'सक्रिय नौकरियां',
          workers: 'सत्यापित कामगार',
          employers: 'विश्वसनीय नियोक्ता'
        }
      },
      features: {
        title: 'LocalJobs क्यों चुनें',
        subtitle: 'स्थानीय प्रतिभा खोजने या नियुक्त करने के लिए आवश्यक सब कुछ',
        items: [
          {
            icon: MapPin,
            title: 'हाइपरलोकल मिलान',
            description: 'अपने पड़ोस में नौकरियां और कामगार खोजें'
          },
          {
            icon: Shield,
            title: 'सत्यापित प्रोफाइल',
            description: 'आधार और दस्तावेजों से सभी उपयोगकर्ता सत्यापित'
          },
          {
            icon: Zap,
            title: 'तत्काल कनेक्शन',
            description: 'मिनटों में आवेदन करें और नियुक्त करें'
          },
          {
            icon: Clock,
            title: '24/7 सहायता',
            description: 'जब भी आवश्यकता हो सहायता प्राप्त करें'
          },
          {
            icon: Target,
            title: 'स्मार्ट मिलान',
            description: 'AI-संचालित नौकरी सिफारिशें'
          },
          {
            icon: Award,
            title: 'गुणवत्ता आश्वासन',
            description: 'पारदर्शिता के लिए रेटिंग और समीक्षाएं'
          }
        ]
      },
      howItWorks: {
        title: 'कैसे काम करता है',
        subtitle: '3 सरल चरणों में शुरू करें',
        worker: {
          title: 'नौकरी चाहने वालों के लिए',
          steps: [
            {
              number: '01',
              title: 'प्रोफाइल बनाएं',
              description: 'अपने फोन से साइन अप करें और दस्तावेज अपलोड करें'
            },
            {
              number: '02',
              title: 'नौकरियां ब्राउज़ करें',
              description: 'अपने कौशल से मेल खाने वाली स्थानीय नौकरियां खोजें'
            },
            {
              number: '03',
              title: 'नियुक्त हों',
              description: 'तुरंत आवेदन करें और नियोक्ताओं से जुड़ें'
            }
          ]
        },
        employer: {
          title: 'नियोक्ताओं के लिए',
          steps: [
            {
              number: '01',
              title: 'नौकरी पोस्ट करें',
              description: 'मिनटों में विस्तृत नौकरी लिस्टिंग बनाएं'
            },
            {
              number: '02',
              title: 'उम्मीदवारों की समीक्षा करें',
              description: 'सत्यापित कार्यकर्ता प्रोफाइल और आवेदन देखें'
            },
            {
              number: '03',
              title: 'तेजी से नियुक्त करें',
              description: 'सीधे जुड़ें और सर्वश्रेष्ठ प्रतिभा को नियुक्त करें'
            }
          ]
        }
      },
      cta: {
        title: 'शुरू करने के लिए तैयार?',
        subtitle: 'हजारों कामगारों और नियोक्ताओं से जुड़ें जो पहले से LocalJobs का उपयोग कर रहे हैं',
        button: 'अभी शुरू करें - यह मुफ़्त है'
      },
      footer: {
        tagline: 'स्थानीय कामगारों को स्थानीय नौकरियों से जोड़ना',
        copyright: '© 2024 LocalJobs. सर्वाधिकार सुरक्षित।'
      }
    }
  };

  const t = content[language];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Custom Magnifying Glass Cursor */}
      <div
        className="pointer-events-none fixed z-50 transition-transform duration-100 ease-out"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.2 : 1})`
        }}
      >
        <div className="relative">
          <Search
            className="w-8 h-8 text-primary-600"
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Navigation */}
      <nav className="relative z-40 bg-white/80 backdrop-blur-md border-b border-border sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 group cursor-pointer"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative">
                <Briefcase className="w-8 h-8 text-primary-600 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-lg group-hover:bg-primary-400/40 transition-all" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                LocalJobs
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-primary-600 transition-colors font-medium"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {t.nav.features}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-foreground hover:text-primary-600 transition-colors font-medium"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {t.nav.howItWorks}
              </button>

              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    language === 'hi'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  हिं
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/auth/phone')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {t.nav.login}
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/auth/phone')}
                className="group relative overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="relative z-10">{t.nav.getStarted}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                {t.nav.features}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                {t.nav.howItWorks}
              </button>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" fullWidth onClick={() => navigate('/auth/phone')}>
                  {t.nav.login}
                </Button>
                <Button variant="primary" fullWidth onClick={() => navigate('/auth/phone')}>
                  {t.nav.getStarted}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth/phone')}
                  className="group relative overflow-hidden"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span className="relative z-10 flex items-center">
                    {t.hero.ctaPrimary}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/auth/phone')}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {t.hero.ctaSecondary}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { label: t.hero.stats.jobs, value: '500+', icon: Briefcase },
                  { label: t.hero.stats.workers, value: '2000+', icon: Users },
                  { label: t.hero.stats.employers, value: '150+', icon: TrendingUp }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center group cursor-pointer"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Illustration */}
            <div className="relative animate-fade-in-right">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Floating Cards Animation */}
                <div className="absolute inset-0">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="absolute bg-white rounded-2xl shadow-2xl p-6 animate-float-card"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 15}%`,
                        width: '200px',
                        animationDelay: `${i * 0.2}s`,
                        transform: `rotate(${i * 5 - 7.5}deg)`
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded w-20 mb-1" />
                          <div className="h-2 bg-gray-100 rounded w-16" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded" />
                        <div className="h-2 bg-gray-100 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Central Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-32 h-32 bg-primary-600 rounded-3xl flex items-center justify-center transform rotate-12 animate-pulse-scale">
                      <Search className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                    <div className="absolute inset-0 bg-primary-400 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="mb-6 relative inline-block">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="absolute inset-0 bg-primary-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Worker Steps */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-8 h-8 mr-3 text-primary-600" />
                {t.howItWorks.worker.title}
              </h3>
              {t.howItWorks.worker.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-6 group cursor-pointer"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Employer Steps */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-primary-600" />
                {t.howItWorks.employer.title}
              </h3>
              {t.howItWorks.employer.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-6 group cursor-pointer"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            {t.cta.subtitle}
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/auth/phone')}
            className="bg-white text-primary-600 hover:bg-gray-100 group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span className="flex items-center">
              {t.cta.button}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Briefcase className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold text-white">LocalJobs</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">{t.footer.tagline}</p>
              <p className="text-sm text-gray-500">{t.footer.copyright}</p>
              <div className="mt-3">
                <a
                  href="/admin/login"
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }

        @keyframes float-card {
          0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
          50% { transform: translateY(-15px) rotate(var(--rotation)); }
        }

        @keyframes pulse-scale {
          0%, 100% { transform: rotate(12deg) scale(1); }
          50% { transform: rotate(12deg) scale(1.05); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        .animate-float-card {
          animation: float-card 4s ease-in-out infinite;
        }

        .animate-pulse-scale {
          animation: pulse-scale 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.2s both;
        }

        html {
          cursor: none;
        }

        button, a, input {
          cursor: none;
        }
      `}</style>
    </div>
  );
};
