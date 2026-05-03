import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Zap, Users, Briefcase, Phone, Search, Check, Star, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// ─── ScrollReveal ────────────────────────────────────────────────
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
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
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
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
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'worker') navigate('/worker/dashboard', { replace: true });
      else if (user.role === 'employer') navigate('/employer/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen text-white">
        {/* Gradient fallback (always visible until video loads) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 z-0" />

        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={`${import.meta.env.BASE_URL}bgposter.jpg`}
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={`${import.meta.env.BASE_URL}bgvideo.mp4`}
        />

        {/* Subtle gradient for text readability */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Navbar */}
        <div className="relative z-20 px-4 sm:px-6 md:px-12 lg:px-16 pt-4 sm:pt-6">
          <div className="liquid-glass rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">LocalJobs</span>
            <button
              onClick={() => navigate('/auth/phone')}
              className="bg-white text-black px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-gray-100 transition-colors min-h-[48px]"
            >
              लॉगिन करें
            </button>
          </div>
        </div>

        {/* Hero content — bottom */}
        <div className="relative z-10 min-h-screen flex flex-col justify-end px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-5xl">
            {/* Main Hindi heading — MASSIVE */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.1] mb-4 sm:mb-6" style={{ letterSpacing: '-0.03em' }}>
              अपने शहर में<br />नौकरी पाएं
            </h1>

            {/* English subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl text-white/80 mb-6 sm:mb-8 max-w-2xl font-light">
              Find trusted jobs near you. Apply without resume.
            </p>

            {/* Hindi description — big and readable */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/60 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              बिना रिज़्यूमे के आवेदन करें। सीधा नियोक्ता से बात करें। कोई फीस नहीं। कोई बिचौलिया नहीं।
            </p>

            {/* CTA buttons — big for mobile */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate('/auth/phone')}
                className="bg-white text-black px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-xl sm:text-2xl min-h-[64px] hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
              >
                नौकरी खोजें
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button
                onClick={() => navigate('/auth/phone')}
                className="liquid-glass border border-white/30 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-xl sm:text-2xl min-h-[64px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
              >
                वर्कर ढूंढें
              </button>
            </div>

            {/* Job types pill — liquid glass */}
            <div className="liquid-glass border border-white/20 px-5 sm:px-6 py-3 sm:py-4 rounded-xl inline-block">
              <p className="text-xl sm:text-2xl md:text-3xl font-medium">
                डिलीवरी · ड्राइवर · मैकेनिक · हेल्पर · सेल्स
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="bg-blue-600 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            {[
              { value: '500+', hi: 'नौकरियां', en: 'Jobs' },
              { value: '2000+', hi: 'कामगार', en: 'Workers' },
              { value: '150+', hi: 'नियोक्ता', en: 'Employers' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold">{stat.value}</div>
                <div className="text-lg sm:text-xl font-semibold mt-1">{stat.hi}</div>
                <div className="text-sm sm:text-base text-white/70">{stat.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
                कैसे काम करता है?
              </h2>
              <p className="text-xl sm:text-2xl text-gray-500">
                How It Works — 3 Easy Steps
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                icon: Phone,
                color: 'bg-blue-100 text-blue-600',
                hi: 'फ़ोन से साइन अप करें',
                en: 'Sign Up with Phone',
                descHi: 'अपना फ़ोन नंबर डालें। OTP आएगा। बस, अकाउंट बन गया। ईमेल की ज़रूरत नहीं।',
                descEn: 'Enter phone, get OTP, done.',
              },
              {
                step: '02',
                icon: Search,
                color: 'bg-green-100 text-green-600',
                hi: 'नौकरी खोजें या पोस्ट करें',
                en: 'Find or Post Jobs',
                descHi: 'कामगार — अपने शहर में नौकरी ढूंढें। नियोक्ता — अपनी ज़रूरत पोस्ट करें। AI सही मैच दिखाएगा।',
                descEn: 'Workers browse. Employers post. AI matches both.',
              },
              {
                step: '03',
                icon: Users,
                color: 'bg-purple-100 text-purple-600',
                hi: 'सीधा संपर्क करें',
                en: 'Connect Directly',
                descHi: 'आवेदन करें, सत्यापित नंबर मिलेगा। कोई बिचौलिया नहीं। कोई फीस नहीं।',
                descEn: 'Apply, get verified contact. No middlemen.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${item.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div className="text-gray-400 text-base font-medium mb-2">Step {item.step}</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{item.hi}</h3>
                  <p className="text-lg sm:text-xl text-blue-600 font-medium mb-4">{item.en}</p>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-2">{item.descHi}</p>
                  <p className="text-base text-gray-500">{item.descEn}</p>
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
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
                LocalJobs क्यों चुनें?
              </h2>
              <p className="text-xl sm:text-2xl text-gray-500">
                Why Choose LocalJobs?
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: MapPin,
                bgColor: 'bg-blue-50',
                iconColor: 'text-blue-600',
                borderColor: 'border-blue-100',
                hi: 'अपने पास की नौकरी',
                en: 'Hyperlocal Jobs',
                descHi: 'अपने मोहल्ले और शहर में ही नौकरी पाएं। दूर जाने की ज़रूरत नहीं।',
                checks: ['शहर के अनुसार खोज', 'एरिया लेवल मिलान'],
              },
              {
                icon: Shield,
                bgColor: 'bg-green-50',
                iconColor: 'text-green-600',
                borderColor: 'border-green-100',
                hi: 'सत्यापित प्रोफाइल',
                en: 'Verified Profiles',
                descHi: 'सभी कामगार और नियोक्ता आधार और दस्तावेज़ से सत्यापित हैं।',
                checks: ['आधार सत्यापन', 'रेटिंग और समीक्षा'],
              },
              {
                icon: Zap,
                bgColor: 'bg-yellow-50',
                iconColor: 'text-yellow-600',
                borderColor: 'border-yellow-100',
                hi: 'तुरंत आवेदन',
                en: 'Instant Apply',
                descHi: 'एक टैप में आवेदन करें। रिज़्यूमे की ज़रूरत नहीं। फ़ोटो से ऑटो-फ़िल।',
                checks: ['बिना रिज़्यूमे के', 'रियल-टाइम ट्रैकिंग'],
              },
              {
                icon: Briefcase,
                bgColor: 'bg-purple-50',
                iconColor: 'text-purple-600',
                borderColor: 'border-purple-100',
                hi: 'स्मार्ट मिलान',
                en: 'Smart Matching',
                descHi: 'आपके कौशल और अनुभव के अनुसार सही नौकरी मिलेगी।',
                checks: ['कौशल मिलान', 'वेतन फ़िल्टर'],
              },
              {
                icon: Clock,
                bgColor: 'bg-orange-50',
                iconColor: 'text-orange-600',
                borderColor: 'border-orange-100',
                hi: 'तुरंत जवाब',
                en: 'Quick Response',
                descHi: 'नियोक्ता 24 घंटे में जवाब देते हैं। इंतज़ार नहीं करना पड़ेगा।',
                checks: ['स्टेटस अपडेट', 'सूचना अलर्ट'],
              },
              {
                icon: Star,
                bgColor: 'bg-pink-50',
                iconColor: 'text-pink-600',
                borderColor: 'border-pink-100',
                hi: 'बिल्कुल मुफ़्त',
                en: 'Completely Free',
                descHi: 'कामगारों के लिए सब कुछ मुफ़्त। कोई छिपा शुल्क नहीं।',
                checks: ['मुफ़्त आवेदन', 'मुफ़्त प्रोफाइल'],
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`rounded-2xl p-5 sm:p-7 border ${feature.borderColor} ${feature.bgColor} hover:shadow-md transition-shadow h-full`}>
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.bgColor} ${feature.iconColor} rounded-xl flex items-center justify-center mb-4 border ${feature.borderColor}`}>
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{feature.hi}</h3>
                  <p className="text-lg sm:text-xl font-medium text-blue-600 mb-3">{feature.en}</p>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-4">{feature.descHi}</p>

                  <div className="space-y-2">
                    {feature.checks.map((check, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                        <span className="text-base sm:text-lg text-gray-700 font-medium">{check}</span>
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
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
                ये नौकरियां उपलब्ध हैं
              </h2>
              <p className="text-xl sm:text-2xl text-gray-500">
                Available Job Categories
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { hi: 'डिलीवरी', en: 'Delivery', icon: '🛵' },
              { hi: 'ड्राइवर', en: 'Driver', icon: '🚗' },
              { hi: 'मैकेनिक', en: 'Mechanic', icon: '🔧' },
              { hi: 'हेल्पर', en: 'Helper', icon: '🤝' },
              { hi: 'सुरक्षा गार्ड', en: 'Security', icon: '🛡️' },
              { hi: 'रसोइया', en: 'Cook', icon: '👨‍🍳' },
              { hi: 'इलेक्ट्रीशियन', en: 'Electrician', icon: '⚡' },
              { hi: 'प्लंबर', en: 'Plumber', icon: '🔩' },
              { hi: 'सेल्स', en: 'Sales', icon: '🏪' },
              { hi: 'सफाई कर्मी', en: 'Cleaner', icon: '🧹' },
              { hi: 'दर्जी', en: 'Tailor', icon: '🧵' },
              { hi: 'पेंटर', en: 'Painter', icon: '🎨' },
            ].map((cat, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div
                  onClick={() => navigate('/auth/phone')}
                  className="bg-white rounded-xl p-5 sm:p-6 text-center border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="text-4xl sm:text-5xl mb-3">{cat.icon}</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{cat.hi}</div>
                  <div className="text-base sm:text-lg text-gray-500">{cat.en}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOR EMPLOYERS ═══════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-600 rounded-3xl p-6 sm:p-10 md:p-16 text-white">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
                नियोक्ताओं के लिए
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-blue-100 mb-4 text-center">
                For Employers — Find Workers Fast
              </p>
              <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto mb-10 text-center leading-relaxed">
                अपने बिजनेस के लिए सही कामगार ढूंढें। जॉब पोस्ट करें, आवेदन देखें, सीधा संपर्क करें।
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
                {[
                  { hi: 'मुफ़्त', en: 'Free to Post', descHi: 'जॉब पोस्ट करना बिल्कुल मुफ़्त' },
                  { hi: '24 घंटे', en: '24h Response', descHi: 'तुरंत आवेदन मिलेंगे' },
                  { hi: 'सत्यापित', en: 'Verified Workers', descHi: 'आधार से सत्यापित कामगार' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/15 rounded-xl p-5 sm:p-6 text-center">
                    <div className="text-3xl sm:text-4xl font-bold">{item.hi}</div>
                    <div className="text-lg sm:text-xl font-medium text-blue-100 mt-1">{item.en}</div>
                    <div className="text-base sm:text-lg text-blue-200 mt-2">{item.descHi}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="text-center">
                <button
                  onClick={() => navigate('/auth/phone')}
                  className="inline-flex items-center gap-3 bg-white text-blue-600 font-bold px-10 sm:px-12 py-4 sm:py-5 rounded-xl text-xl sm:text-2xl hover:bg-blue-50 transition-colors min-h-[64px]"
                >
                  अभी शुरू करें
                  <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              आज ही शुरू करें
            </h2>
            <p className="text-xl sm:text-2xl text-gray-500 mb-4">
              Start Today — It's Free
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
              हज़ारों कामगार और नियोक्ता पहले से LocalJobs पर हैं। अपने फ़ोन नंबर से 1 मिनट में साइन अप करें।
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth/phone')}
                className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-bold px-10 py-5 rounded-xl text-xl sm:text-2xl hover:bg-blue-700 transition-colors min-h-[64px]"
              >
                नौकरी खोजें
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('/auth/phone')}
                className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 font-bold px-10 py-5 rounded-xl text-xl sm:text-2xl border-2 border-gray-200 hover:border-blue-400 transition-colors min-h-[64px]"
              >
                वर्कर ढूंढें
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-400" />
            <span className="text-2xl font-bold text-white">LocalJobs</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-lg text-gray-400">
              स्थानीय कामगारों को स्थानीय नौकरियों से जोड़ना
            </p>
            <p className="text-base text-gray-500 mt-1">
              Connecting local workers with local jobs
            </p>
            <p className="text-sm text-gray-600 mt-3">&copy; 2024 LocalJobs. All rights reserved.</p>
            <a href="/local-job-portal/admin/login" className="text-xs text-gray-700 hover:text-gray-400 mt-2 inline-block">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
