import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'राजेश कुमार',
    role: 'Delivery Boy, Delhi',
    text: 'LocalJobs से मुझे 2 दिन में नौकरी मिल गई। बहुत आसान प्रोसेस है।',
    textEn: 'Got a job in 2 days through LocalJobs. Very easy process.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Restaurant Owner, Mumbai',
    text: 'हमारे रेस्टोरेंट के लिए 3 वेटर मिले, सब सत्यापित और भरोसेमंद।',
    textEn: 'Found 3 verified waiters for our restaurant. All trustworthy.',
    rating: 5,
  },
  {
    name: 'अमित वर्मा',
    role: 'Driver, Jaipur',
    text: 'बिना रिज़्यूमे के अप्लाई किया, सीधा मालिक से बात हुई। कोई बिचौलिया नहीं।',
    textEn: 'Applied without resume, talked directly to the owner. No middleman.',
    rating: 4,
  },
  {
    name: 'Sunita Devi',
    role: 'Shop Owner, Lucknow',
    text: 'पहले काम वालों को ढूंढना बहुत मुश्किल था। LocalJobs ने आसान बना दिया।',
    textEn: 'Finding workers used to be very hard. LocalJobs made it easy.',
    rating: 5,
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            लोग क्या कहते हैं
          </h2>
          <p className="text-xl sm:text-2xl text-gray-500">
            What People Say
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-5 h-5 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-2">
                "{t.text}"
              </p>
              <p className="text-base text-gray-500 mb-4">{t.textEn}</p>
              <div>
                <p className="text-lg font-bold text-gray-900">{t.name}</p>
                <p className="text-base text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
