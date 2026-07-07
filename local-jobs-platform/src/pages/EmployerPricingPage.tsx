import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Zap, Shield, Users, BarChart3, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    nameHi: 'मुफ़्त',
    price: '₹0',
    period: 'forever',
    features: [
      '3 job posts per month / हर महीने 3 जॉब पोस्ट',
      'View applicants / आवेदक देखें',
      'Basic support / बेसिक सहायता',
    ],
    highlighted: false,
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    nameHi: 'प्रो',
    price: '₹499',
    period: '/month',
    features: [
      'Unlimited job posts / असीमित जॉब पोस्ट',
      'Priority listing / प्राथमिकता लिस्टिंग',
      'Worker search / वर्कर खोज',
      '50 contact credits / 50 संपर्क क्रेडिट',
      'Job analytics / जॉब एनालिटिक्स',
      'Email support / ईमेल सहायता',
    ],
    highlighted: true,
    cta: 'Upgrade Now',
  },
  {
    name: 'Enterprise',
    nameHi: 'एंटरप्राइज़',
    price: '₹1,999',
    period: '/month',
    features: [
      'Everything in Pro / प्रो की सभी सुविधाएं',
      '200 contact credits / 200 संपर्क क्रेडिट',
      'Featured listings / फीचर्ड लिस्टिंग',
      'Bulk hiring tools / बल्क हायरिंग टूल्स',
      'Dedicated account manager / समर्पित अकाउंट मैनेजर',
      'API access / API एक्सेस',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const creditPacks = [
  { credits: 10, price: 99, perCredit: 9.9 },
  { credits: 25, price: 199, perCredit: 7.96 },
  { credits: 50, price: 349, perCredit: 6.98 },
  { credits: 100, price: 599, perCredit: 5.99 },
];

const benefits = [
  { icon: Zap, title: 'Faster Hiring', titleHi: 'तेज़ हायरिंग', desc: 'Get verified workers in 24 hours', descHi: '24 घंटे में सत्यापित कामगार पाएं' },
  { icon: Shield, title: 'Verified Workers', titleHi: 'सत्यापित कामगार', desc: 'All workers are document-verified', descHi: 'सभी कामगार दस्तावेज़-सत्यापित' },
  { icon: Users, title: 'Direct Contact', titleHi: 'सीधा संपर्क', desc: 'No middlemen, talk directly', descHi: 'कोई बिचौलिया नहीं, सीधी बात' },
  { icon: BarChart3, title: 'Smart Analytics', titleHi: 'स्मार्ट एनालिटिक्स', desc: 'Track job post performance', descHi: 'अपने जॉब पोस्ट की परफ़ॉर्मेंस ट्रैक करें' },
];

const pricingFaqs = [
  {
    q: 'What are credits? / क्रेडिट क्या हैं?',
    a: 'Credits are used to unlock worker contact details. 1 credit = 1 contact reveal. क्रेडिट का इस्तेमाल कामगार का संपर्क देखने के लिए होता है। 1 क्रेडिट = 1 संपर्क।',
  },
  {
    q: 'Can I get a refund? / क्या रिफंड मिल सकता है?',
    a: 'Unused credits never expire. Subscription can be cancelled anytime, no refund for the current billing period. अनयूज़्ड क्रेडिट कभी एक्सपायर नहीं होते। सब्सक्रिप्शन कभी भी रद्द करें।',
  },
  {
    q: 'How does billing work? / बिलिंग कैसे काम करती है?',
    a: 'Monthly subscription auto-renews. Credit packs are one-time purchases. मासिक सब्सक्रिप्शन ऑटो-रिन्यू होता है। क्रेडिट पैक एक बार की खरीदारी है।',
  },
  {
    q: 'Is there a free trial? / क्या फ़्री ट्रायल है?',
    a: 'The Free plan is permanent with 3 job posts/month. Pro plan has a 7-day free trial. फ्री प्लान स्थायी है। प्रो प्लान में 7 दिन का फ्री ट्रायल है।',
  },
];

export const EmployerPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pricing / मूल्य</h1>
            <p className="text-base text-gray-500">Choose the right plan for your business</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 sm:p-8 border-2 ${
                plan.highlighted
                  ? 'border-blue-600 bg-blue-50 shadow-lg relative'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-base text-gray-500 mb-3">{plan.nameHi}</p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-base text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold text-lg min-h-[48px] transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Buy Credits / क्रेडिट खरीदें
          </h2>
          <p className="text-base text-gray-500 text-center mb-6">
            Use credits to unlock worker contact details
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditPacks.map((pack, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-gray-200 text-center hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl font-bold text-blue-600 mb-1">{pack.credits}</div>
                <div className="text-sm text-gray-500 mb-3">credits</div>
                <div className="text-xl font-bold text-gray-900 mb-1">₹{pack.price}</div>
                <div className="text-xs text-gray-400">₹{pack.perCredit.toFixed(1)}/credit</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Upgrade */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Why Upgrade? / अपग्रेड क्यों करें?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 flex gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{b.title} / {b.titleHi}</h3>
                  <p className="text-base text-gray-600">{b.desc}</p>
                  <p className="text-sm text-gray-400">{b.descHi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            FAQ / अक्सर पूछे जाने वाले सवाल
          </h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {pricingFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-base text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 sm:p-10 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Questions? Contact us</h3>
          <p className="text-lg text-blue-100 mb-2">सवाल? संपर्क करें</p>
          <p className="text-base text-blue-200 mb-6">
            Our team is ready to help / हमारी टीम आपकी मदद के लिए तैयार है
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors min-h-[48px]">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
