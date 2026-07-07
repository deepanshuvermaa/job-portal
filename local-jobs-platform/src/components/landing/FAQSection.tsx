import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'क्या LocalJobs मुफ़्त है? / Is LocalJobs free?',
    a: 'हाँ, कामगारों के लिए बिल्कुल मुफ़्त है। नियोक्ता बेसिक फीचर्स मुफ़्त में इस्तेमाल कर सकते हैं। प्रीमियम फीचर्स के लिए क्रेडिट सिस्टम है। Yes, completely free for workers. Employers get basic features free, with a credit system for premium features.',
  },
  {
    q: 'क्या रिज़्यूमे ज़रूरी है? / Do I need a resume?',
    a: 'नहीं! बस अपना फ़ोन नंबर और बेसिक जानकारी दें। आपकी प्रोफाइल ही आपका रिज़्यूमे है। No! Just provide your phone number and basic info. Your profile is your resume.',
  },
  {
    q: 'प्रोफाइल कैसे सत्यापित होती है? / How is profile verified?',
    a: 'फ़ोन OTP से अकाउंट बनता है। एडमिन टीम दस्तावेज़ जाँच कर सत्यापन करती है। Phone OTP creates the account. Our admin team verifies documents for full verification.',
  },
  {
    q: 'कौन-कौन से शहरों में उपलब्ध है? / Which cities are available?',
    a: 'हम पूरे भारत में उपलब्ध हैं। दिल्ली, मुंबई, बैंगलोर, जयपुर, लखनऊ और सैकड़ों अन्य शहरों में। Available across India — Delhi, Mumbai, Bangalore, Jaipur, Lucknow, and hundreds more.',
  },
  {
    q: 'नियोक्ता कैसे संपर्क करें? / How do employers contact workers?',
    a: 'जब कोई कामगार आवेदन करता है, नियोक्ता को सत्यापित संपर्क मिलता है। सीधा फ़ोन या ऐप से बात कर सकते हैं। When a worker applies, employers get verified contact. They can talk directly via phone or app.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            अक्सर पूछे जाने वाले सवाल
          </h2>
          <p className="text-xl sm:text-2xl text-gray-500">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
