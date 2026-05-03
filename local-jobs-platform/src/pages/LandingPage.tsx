import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, MapPin, Shield, Zap, Users, Briefcase, Phone, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// ─── Animation Components ────────────────────────────────────────

const WordsPullUp: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: delay + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const AnimatedLetter: React.FC<{ char: string; progress: any; index: number; total: number }> = ({ char, progress, index, total }) => {
  const charProgress = index / total;
  const opacity = useTransform(progress, [charProgress - 0.1, charProgress + 0.05], [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {char}
    </motion.span>
  );
};

const ScrollRevealText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.25'],
  });

  const chars = text.split('');

  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => (
        <AnimatedLetter key={i} char={char} progress={scrollYProgress} index={i} total={chars.length} />
      ))}
    </p>
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

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });

  const featureCards = [
    {
      number: '01',
      title: 'Smart Job Matching',
      titleHi: 'स्मार्ट जॉब मिलान',
      icon: Search,
      items: [
        { en: 'Skills-based matching algorithm', hi: 'कौशल-आधारित मिलान' },
        { en: 'Location-aware job discovery', hi: 'लोकेशन के अनुसार नौकरी खोज' },
        { en: 'Salary range filtering', hi: 'वेतन के अनुसार फ़िल्टर' },
        { en: 'Experience-level fit scoring', hi: 'अनुभव स्तर स्कोरिंग' },
      ],
    },
    {
      number: '02',
      title: 'Verified Profiles',
      titleHi: 'सत्यापित प्रोफाइल',
      icon: Shield,
      items: [
        { en: 'Aadhaar & document verification', hi: 'आधार और दस्तावेज़ सत्यापन' },
        { en: 'Business license checks', hi: 'बिजनेस लाइसेंस जांच' },
        { en: 'Ratings & review system', hi: 'रेटिंग और समीक्षा प्रणाली' },
      ],
    },
    {
      number: '03',
      title: 'Instant Apply',
      titleHi: 'तुरंत आवेदन',
      icon: Zap,
      items: [
        { en: 'One-tap job application', hi: 'एक टैप में आवेदन' },
        { en: 'Resume auto-fill from photo', hi: 'फ़ोटो से रिज़्यूमे ऑटो-फ़िल' },
        { en: 'Real-time application tracking', hi: 'रियल-टाइम आवेदन ट्रैकिंग' },
      ],
    },
  ];

  return (
    <div className="bg-black text-[#E1E0CC] overflow-x-hidden">

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="h-screen p-3 md:p-6">
        <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden">
          {/* Background gradient (fallback + overlay) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-black to-purple-900/60 z-0" />

          {/* Animated background shapes */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" style={{ animation: 'pulse 6s ease-in-out infinite' }} />
          </div>

          {/* Noise overlay */}
          <div className="absolute inset-0 z-[2] noise-overlay opacity-[0.5] mix-blend-overlay pointer-events-none" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/40 via-transparent to-black/70" />

          {/* Navbar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/90 backdrop-blur-sm rounded-b-2xl md:rounded-b-3xl px-4 py-2.5 md:px-8 md:py-3">
              <div className="flex items-center gap-4 sm:gap-6 md:gap-12">
                <span className="text-cream font-bold text-sm md:text-base">LocalJobs</span>
                {['Features', 'How It Works', 'For Employers'].map((item) => (
                  <button
                    key={item}
                    onClick={() => document.getElementById(item.toLowerCase().replace(/\s/g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[10px] sm:text-xs md:text-sm font-medium transition-colors hidden sm:block"
                    style={{ color: 'rgba(225, 224, 204, 0.7)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.7)')}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/auth/phone')}
                  className="text-[10px] sm:text-xs md:text-sm font-bold text-black bg-cream px-3 py-1.5 rounded-full"
                >
                  Login
                </button>
              </div>
            </div>
          </div>

          {/* Hero content — bottom aligned */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-end">
              {/* Giant heading */}
              <div className="lg:col-span-8">
                <WordsPullUp
                  text="Local Jobs"
                  className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] font-bold leading-[0.85] tracking-[-0.04em]"
                />
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-cream/60 text-sm sm:text-base md:text-lg mt-2 font-light"
                >
                  अपने शहर में नौकरी पाएं
                </motion.p>
              </div>

              {/* Right column — description + CTA */}
              <div className="lg:col-span-4 space-y-4 sm:space-y-6 pb-2">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-cream/70 text-xs sm:text-sm md:text-base leading-[1.3]"
                >
                  India's hyperlocal job platform connecting workers and employers in Tier 2 & 3 cities.
                  No resume needed. Direct contact. Verified profiles.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-cream/50 text-xs sm:text-sm leading-[1.3]"
                >
                  भारत का हाइपरलोकल जॉब प्लेटफॉर्म। बिना रिज़्यूमे के आवेदन करें। सीधा संपर्क। सत्यापित प्रोफाइल।
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <button
                    onClick={() => navigate('/auth/phone')}
                    className="group inline-flex items-center gap-2 bg-cream text-black font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-full text-sm sm:text-base hover:gap-3 transition-all min-h-[48px]"
                  >
                    <span>Find Jobs / नौकरी खोजें</span>
                    <span className="bg-black rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4 text-cream" />
                    </span>
                  </button>

                  <button
                    onClick={() => navigate('/auth/phone')}
                    className="inline-flex items-center justify-center gap-2 border border-cream/30 text-cream font-medium px-5 py-3 rounded-full text-sm hover:border-cream/60 transition-all min-h-[48px]"
                  >
                    Hire Workers / वर्कर ढूंढें
                  </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="flex gap-6 pt-2"
                >
                  {[
                    { value: '500+', label: 'Jobs', labelHi: 'नौकरियां' },
                    { value: '2000+', label: 'Workers', labelHi: 'कामगार' },
                    { value: '150+', label: 'Employers', labelHi: 'नियोक्ता' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-cream">{stat.value}</div>
                      <div className="text-[10px] sm:text-xs text-cream/50">{stat.label} / {stat.labelHi}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section id="how-it-works" className="bg-black py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#101010] rounded-3xl p-6 sm:p-10 md:p-16 text-center">
            {/* Label */}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-cream text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-8 block"
            >
              How It Works / कैसे काम करता है
            </motion.span>

            {/* Main heading with mixed styles */}
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-4xl mx-auto leading-[0.95] mb-12">
              <WordsPullUp
                text="Your next opportunity is"
                className="justify-center font-normal"
              />
              <WordsPullUp
                text="right in your neighborhood."
                className="justify-center font-serif italic mt-1"
                delay={0.3}
              />
              <WordsPullUp
                text="No travel. No middlemen. Direct connection."
                className="justify-center font-normal mt-1 text-cream/60"
                delay={0.5}
              />
            </div>

            {/* Scroll reveal paragraph */}
            <ScrollRevealText
              text="LocalJobs is built for workers and employers in Tier 2 and Tier 3 cities across India. Whether you are a delivery driver in Lucknow, a mechanic in Indore, or a shop owner in Jaipur looking for helpers, we connect you directly. No agents. No fees. Just verified people finding verified jobs."
              className="text-cream text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed mb-8"
            />

            <ScrollRevealText
              text="LocalJobs उन कामगारों और नियोक्ताओं के लिए बनाया गया है जो टियर 2 और टियर 3 शहरों में रहते हैं। चाहे आप लखनऊ में डिलीवरी ड्राइवर हों, इंदौर में मैकेनिक, या जयपुर में दुकानदार - हम आपको सीधे जोड़ते हैं। कोई एजेंट नहीं। कोई फीस नहीं।"
              className="text-cream/60 text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed"
            />

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  step: '01',
                  icon: Phone,
                  title: 'Sign Up with Phone',
                  titleHi: 'फ़ोन से साइन अप करें',
                  desc: 'OTP verification. No email needed.',
                  descHi: 'OTP सत्यापन। ईमेल की जरूरत नहीं।',
                },
                {
                  step: '02',
                  icon: Search,
                  title: 'Find or Post Jobs',
                  titleHi: 'नौकरी खोजें या पोस्ट करें',
                  desc: 'Workers browse. Employers post. AI matches both.',
                  descHi: 'कामगार खोजें। नियोक्ता पोस्ट करें। AI दोनों को जोड़े।',
                },
                {
                  step: '03',
                  icon: Users,
                  title: 'Connect Directly',
                  titleHi: 'सीधा संपर्क करें',
                  desc: 'Verified contact sharing. No middlemen.',
                  descHi: 'सत्यापित संपर्क। कोई बिचौलिया नहीं।',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-black/50 rounded-2xl p-6 text-center"
                >
                  <div className="w-14 h-14 bg-cream/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-cream" />
                  </div>
                  <div className="text-cream/40 text-xs mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold text-cream mb-1">{item.title}</h3>
                  <p className="text-cream/50 text-sm mb-2">{item.titleHi}</p>
                  <p className="text-cream/40 text-xs">{item.desc}</p>
                  <p className="text-cream/30 text-xs">{item.descHi}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
      <section id="features" className="min-h-screen bg-black py-16 sm:py-24 px-4 sm:px-6 relative">
        {/* Noise background */}
        <div className="absolute inset-0 bg-noise opacity-[0.08] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <WordsPullUp
              text="Built for workers and employers who mean business."
              className="justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal max-w-4xl mx-auto"
            />
            <WordsPullUp
              text="Simple tools. Real results. Zero fees."
              className="justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-500 mt-2"
              delay={0.3}
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-cream/40 text-sm sm:text-base mt-4 max-w-xl mx-auto"
            >
              कामगारों और नियोक्ताओं के लिए बनाया गया। सरल टूल्स। असली नतीजे। शून्य शुल्क।
            </motion.p>
          </div>

          {/* Feature cards grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1 — Hero visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:row-span-1 bg-gradient-to-br from-blue-900/40 to-purple-900/30 rounded-2xl overflow-hidden relative min-h-[280px] lg:min-h-0 flex items-end"
            >
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-6 left-6">
                  <Briefcase className="w-16 h-16 text-cream/10" />
                </div>
                <div className="absolute top-1/2 right-8 -translate-y-1/2">
                  <Search className="w-32 h-32 text-cream/5" strokeWidth={1} />
                </div>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                  <MapPin className="w-20 h-20 text-cream/8" />
                </div>
              </div>
              <div className="relative z-10 p-5 sm:p-6">
                <p className="text-cream text-lg sm:text-xl font-bold leading-tight">
                  Your local job marketplace.
                </p>
                <p className="text-cream/50 text-sm mt-1">
                  आपका स्थानीय नौकरी बाज़ार।
                </p>
              </div>
            </motion.div>

            {/* Feature cards 2-4 */}
            {featureCards.map((card, i) => (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: (i + 1) * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#212121] rounded-2xl p-5 sm:p-6 flex flex-col"
              >
                {/* Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cream/10 rounded-xl flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cream" />
                </div>

                {/* Title with number */}
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-cream">
                    {card.title}
                    <span className="text-cream/30 text-xs ml-2">({card.number})</span>
                  </h3>
                  <p className="text-cream/40 text-xs sm:text-sm">{card.titleHi}</p>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 flex-1">
                  {card.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cream/70 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 text-xs sm:text-sm block">{item.en}</span>
                        <span className="text-gray-500 text-[10px] sm:text-xs block">{item.hi}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Learn more */}
                <button
                  onClick={() => navigate('/auth/phone')}
                  className="mt-4 inline-flex items-center gap-1 text-cream/60 text-xs sm:text-sm hover:text-cream transition-colors group"
                >
                  Get Started
                  <ArrowRight className="w-3 h-3 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Job categories showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-8 bg-[#101010] rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-cream text-lg sm:text-xl font-bold mb-2">Available Job Categories / उपलब्ध नौकरियां</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              {[
                { en: 'Delivery', hi: 'डिलीवरी' },
                { en: 'Driver', hi: 'ड्राइवर' },
                { en: 'Mechanic', hi: 'मैकेनिक' },
                { en: 'Helper', hi: 'हेल्पर' },
                { en: 'Security', hi: 'सुरक्षा' },
                { en: 'Cook', hi: 'रसोइया' },
                { en: 'Electrician', hi: 'इलेक्ट्रीशियन' },
                { en: 'Plumber', hi: 'प्लंबर' },
                { en: 'Sales', hi: 'सेल्स' },
                { en: 'Cleaner', hi: 'सफाई' },
                { en: 'Tailor', hi: 'दर्जी' },
                { en: 'Painter', hi: 'पेंटर' },
              ].map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-cream/5 hover:bg-cream/10 rounded-full text-cream/70 text-xs sm:text-sm font-medium transition-colors cursor-default"
                >
                  {cat.en} / {cat.hi}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section id="for-employers" className="bg-black py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <WordsPullUp
            text="Ready to find your next opportunity?"
            className="justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-cream/50 text-base sm:text-lg mt-4 mb-3"
          >
            Join thousands of workers and employers already on LocalJobs.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-cream/35 text-sm sm:text-base mb-8"
          >
            हज़ारों कामगार और नियोक्ता पहले से LocalJobs पर हैं। अभी शुरू करें — यह मुफ़्त है।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/auth/phone')}
              className="group inline-flex items-center justify-center gap-2 bg-cream text-black font-bold px-8 py-4 rounded-full text-base sm:text-lg hover:gap-3 transition-all min-h-[56px]"
            >
              <span>Start Now / अभी शुरू करें</span>
              <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-cream" />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-[#0a0a0a] border-t border-cream/10 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cream/60" />
            <span className="text-lg font-bold text-cream">LocalJobs</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-cream/30 text-sm">
              Connecting local workers with local jobs / स्थानीय कामगारों को स्थानीय नौकरियों से जोड़ना
            </p>
            <p className="text-cream/20 text-xs mt-2">&copy; 2024 LocalJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
