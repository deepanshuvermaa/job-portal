import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Zap, Users, Briefcase, Phone, Search, Check, Star, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// ─── FadeIn wrapper ──────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; duration?: number; children: React.ReactNode; className?: string }> = ({
  delay = 0, duration = 800, children, className = ''
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Animated character-by-character heading ─────────────────────
const AnimatedHeading: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  const lines = text.split('\n');
  const charDelay = 30;

  return (
    <h1 className={className}>
      {lines.map((line, lineIdx) => {
        const prevCharsCount = lines.slice(0, lineIdx).reduce((sum, l) => sum + l.length, 0);
        return (
          <span key={lineIdx} className="block">
            {line.split('').map((char, charIdx) => {
              const totalDelay = (prevCharsCount + charIdx) * charDelay;
              return (
                <span
                  key={charIdx}
                  className="inline-block transition-all duration-500"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDelay: `${totalDelay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
};

// ─── ScrollReveal for section titles ─────────────────────────────
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Main Landing Page ───────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'worker') navigate('/worker/dashboard', { replace: true });
      else if (user.role === 'employer') navigate('/employer/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">

      {/* ═══════════════════ HERO — VIDEO BG ═══════════════════ */}
      <section className="relative h-screen text-white">
        {/* Video background — NO overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        />

        {/* Navbar */}
        <div className="relative z-20 px-4 sm:px-6 md:px-12 lg:px-16 pt-4 sm:pt-6">
          <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight">LocalJobs</span>

            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              {[
                { en: 'Features', id: 'features' },
                { en: 'How It Works', id: 'how-it-works' },
                { en: 'Job Types', id: 'job-types' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {item.en}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth/phone')}
              className="bg-white text-black px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors min-h-[40px]"
            >
              Login / लॉगिन
            </button>
          </div>
        </div>

        {/* Hero content — bottom aligned */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">
            {/* Left — heading */}
            <div>
              <AnimatedHeading
                text={"अपने शहर में\nनौकरी पाएं"}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium mb-4"
                />

              <FadeIn delay={800} duration={1000}>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-5 max-w-xl" style={{ letterSpacing: '-0.02em' }}>
                  Find trusted jobs near you. Apply without resume. Direct employer contact.
                </p>
              </FadeIn>

              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate('/auth/phone')}
                    className="bg-white text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-base sm:text-lg min-h-[52px] hover:bg-gray-100 transition-colors"
                  >
                    नौकरी खोजें / Find Jobs
                  </button>
                  <button
                    onClick={() => navigate('/auth/phone')}
                    className="liquid-glass border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium text-base sm:text-lg min-h-[52px] hover:bg-white hover:text-black transition-all"
                  >
                    वर्कर ढूंढें / Hire Workers
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* Right — tag */}
            <FadeIn delay={1400} duration={1000} className="mt-6 lg:mt-0 flex items-end justify-start lg:justify-end">
              <div className="liquid-glass border border-white/20 px-5 sm:px-6 py-3 rounded-xl">
                <p className="text-lg sm:text-xl lg:text-2xl font-light">
                  Delivery. Driver. Mechanic. Helper.
                </p>
                <p className="text-sm sm:text-base text-white/60 mt-1">
                  डिलीवरी। ड्राइवर। मैकेनिक। हेल्पर।
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="bg-blue-600 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            {[
              { value: '500+', en: 'Active Jobs', hi: 'सक्रिय नौकरियां' },
              { value: '2000+', en: 'Workers', hi: 'कामगार' },
              { value: '150+', en: 'Employers', hi: 'नियोक्ता' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm sm:text-base font-medium mt-1">{stat.en}</div>
                <div className="text-xs sm:text-sm text-white/70">{stat.hi}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                कैसे काम करता है?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                3 आसान स्टेप में अपनी नौकरी पाएं
              </p>
              <p className="text-base sm:text-lg text-gray-500 mt-1">
                Get started in 3 simple steps
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                icon: Phone,
                color: 'bg-blue-100 text-blue-600',
                title: 'फ़ोन से साइन अप',
                titleEn: 'Sign Up with Phone',
                desc: 'अपना फ़ोन नंबर डालें, OTP आएगा, बस हो गया। ईमेल की ज़रूरत नहीं।',
                descEn: 'Enter phone, get OTP, done. No email needed.',
              },
              {
                step: '02',
                icon: Search,
                color: 'bg-green-100 text-green-600',
                title: 'नौकरी खोजें या पोस्ट करें',
                titleEn: 'Find or Post Jobs',
                desc: 'कामगार अपने शहर में नौकरी ढूंढें। नियोक्ता अपनी ज़रूरत पोस्ट करें।',
                descEn: 'Workers find jobs nearby. Employers post requirements.',
              },
              {
                step: '03',
                icon: Users,
                color: 'bg-purple-100 text-purple-600',
                title: 'सीधा संपर्क करें',
                titleEn: 'Connect Directly',
                desc: 'सत्यापित संपर्क नंबर मिलेगा। कोई बिचौलिया नहीं। कोई फीस नहीं।',
                descEn: 'Get verified contact. No middlemen. No fees.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-gray-400 text-sm font-medium mb-2">Step {item.step}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-base sm:text-lg text-blue-600 font-medium mb-3">{item.titleEn}</p>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-sm sm:text-base text-gray-500">{item.descEn}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                LocalJobs क्यों चुनें?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Why choose LocalJobs?
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: MapPin,
                color: 'bg-blue-50 text-blue-600 border-blue-100',
                title: 'अपने पास की नौकरी',
                titleEn: 'Hyperlocal Jobs',
                desc: 'अपने मोहल्ले और शहर में ही नौकरी पाएं।',
                descEn: 'Find jobs in your exact neighborhood.',
                checks: ['City-wise search / शहर के अनुसार', 'Area-level matching / एरिया लेवल'],
              },
              {
                icon: Shield,
                color: 'bg-green-50 text-green-600 border-green-100',
                title: 'सत्यापित प्रोफाइल',
                titleEn: 'Verified Profiles',
                desc: 'सभी कामगार और नियोक्ता आधार से सत्यापित।',
                descEn: 'All workers & employers Aadhaar verified.',
                checks: ['Document verification / दस्तावेज़ सत्यापन', 'Rating system / रेटिंग सिस्टम'],
              },
              {
                icon: Zap,
                color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                title: 'तुरंत आवेदन',
                titleEn: 'Instant Apply',
                desc: 'एक टैप में आवेदन। रिज़्यूमे की ज़रूरत नहीं।',
                descEn: 'One-tap apply. No resume needed.',
                checks: ['Photo se auto-fill / फोटो से ऑटो-फ़िल', 'Real-time tracking / रियल-टाइम ट्रैकिंग'],
              },
              {
                icon: Briefcase,
                color: 'bg-purple-50 text-purple-600 border-purple-100',
                title: 'स्मार्ट मिलान',
                titleEn: 'Smart Matching',
                desc: 'आपके कौशल और अनुभव के अनुसार सही नौकरी।',
                descEn: 'Right job based on your skills & experience.',
                checks: ['Skill matching / कौशल मिलान', 'Salary filter / वेतन फ़िल्टर'],
              },
              {
                icon: Clock,
                color: 'bg-orange-50 text-orange-600 border-orange-100',
                title: 'तुरंत जवाब',
                titleEn: 'Quick Response',
                desc: 'नियोक्ता 24 घंटे में जवाब देते हैं।',
                descEn: 'Employers respond within 24 hours.',
                checks: ['Status updates / स्टेटस अपडेट', 'Notification alerts / सूचना'],
              },
              {
                icon: Star,
                color: 'bg-pink-50 text-pink-600 border-pink-100',
                title: 'बिल्कुल मुफ़्त',
                titleEn: 'Completely Free',
                desc: 'कामगारों के लिए सब कुछ मुफ़्त। कोई छिपा शुल्क नहीं।',
                descEn: 'Everything free for workers. No hidden charges.',
                checks: ['Free apply / मुफ़्त आवेदन', 'Free profile / मुफ़्त प्रोफाइल'],
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`rounded-2xl p-5 sm:p-6 border ${feature.color.split(' ')[2]} hover:shadow-md transition-shadow h-full`}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color.split(' ').slice(0, 2).join(' ')} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm sm:text-base font-medium text-blue-600 mb-2">{feature.titleEn}</p>
                  <p className="text-base sm:text-lg text-gray-700 mb-3">{feature.desc}</p>
                  <p className="text-sm text-gray-500 mb-3">{feature.descEn}</p>

                  <div className="space-y-2">
                    {feature.checks.map((check, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-600">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ JOB CATEGORIES ═══════════════════ */}
      <section id="job-types" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                उपलब्ध नौकरियां
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Available Job Categories
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { en: 'Delivery', hi: 'डिलीवरी', icon: '🛵' },
              { en: 'Driver', hi: 'ड्राइवर', icon: '🚗' },
              { en: 'Mechanic', hi: 'मैकेनिक', icon: '🔧' },
              { en: 'Helper', hi: 'हेल्पर', icon: '🤝' },
              { en: 'Security', hi: 'सुरक्षा गार्ड', icon: '🛡️' },
              { en: 'Cook', hi: 'रसोइया', icon: '👨‍🍳' },
              { en: 'Electrician', hi: 'इलेक्ट्रीशियन', icon: '⚡' },
              { en: 'Plumber', hi: 'प्लंबर', icon: '🔩' },
              { en: 'Sales', hi: 'सेल्स', icon: '🏪' },
              { en: 'Cleaner', hi: 'सफाई कर्मी', icon: '🧹' },
              { en: 'Tailor', hi: 'दर्जी', icon: '🧵' },
              { en: 'Painter', hi: 'पेंटर', icon: '🎨' },
            ].map((cat, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div
                  onClick={() => navigate('/auth/phone')}
                  className="bg-white rounded-xl p-4 sm:p-5 text-center border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="text-3xl sm:text-4xl mb-2">{cat.icon}</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">{cat.hi}</div>
                  <div className="text-sm sm:text-base text-gray-500">{cat.en}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOR EMPLOYERS ═══════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-600 rounded-3xl p-6 sm:p-10 md:p-14 text-white text-center">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                नियोक्ताओं के लिए
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-blue-100 mb-3">
                For Employers — Find Workers Fast
              </p>
              <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto mb-8">
                अपने बिजनेस के लिए सही कामगार ढूंढें। जॉब पोस्ट करें, आवेदन देखें, सीधा संपर्क करें।
                Post jobs, review applications, hire directly.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {[
                  { value: 'मुफ़्त', sub: 'Free to Post', desc: 'जॉब पोस्ट करना मुफ़्त' },
                  { value: '24 घंटे', sub: '24 Hour Response', desc: 'तुरंत आवेदन मिलेंगे' },
                  { value: 'सत्यापित', sub: 'Verified Workers', desc: 'आधार से सत्यापित कामगार' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 sm:p-5">
                    <div className="text-xl sm:text-2xl font-bold">{item.value}</div>
                    <div className="text-sm sm:text-base font-medium text-blue-100">{item.sub}</div>
                    <div className="text-xs sm:text-sm text-blue-200 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <button
                onClick={() => navigate('/auth/phone')}
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 sm:px-10 py-4 rounded-xl text-lg sm:text-xl hover:bg-blue-50 transition-colors min-h-[56px]"
              >
                <span>अभी शुरू करें / Get Started</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              आज ही शुरू करें
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 mb-3">
              Start Today — It's Free
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto">
              हज़ारों कामगार और नियोक्ता पहले से LocalJobs पर हैं। अपने फ़ोन नंबर से 1 मिनट में साइन अप करें।
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth/phone')}
                className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-bold px-8 sm:px-10 py-4 rounded-xl text-lg sm:text-xl hover:bg-blue-700 transition-colors min-h-[56px]"
              >
                <span>नौकरी खोजें / Find Jobs</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => navigate('/auth/phone')}
                className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 font-bold px-8 sm:px-10 py-4 rounded-xl text-lg sm:text-xl border-2 border-gray-200 hover:border-blue-300 transition-colors min-h-[56px]"
              >
                <span>वर्कर ढूंढें / Hire</span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span className="text-lg sm:text-xl font-bold text-white">LocalJobs</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm sm:text-base text-gray-400">
              स्थानीय कामगारों को स्थानीय नौकरियों से जोड़ना
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Connecting local workers with local jobs
            </p>
            <p className="text-xs text-gray-600 mt-2">&copy; 2024 LocalJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
