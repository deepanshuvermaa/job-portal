import React from 'react';

const logos = [
  { name: 'Swiggy', icon: '🛵' },
  { name: 'Zomato', icon: '🍔' },
  { name: 'BigBasket', icon: '🛒' },
  { name: 'Flipkart', icon: '📦' },
  { name: 'Urban Company', icon: '🔧' },
  { name: 'Rapido', icon: '🏍️' },
  { name: 'Dunzo', icon: '📬' },
  { name: 'PharmEasy', icon: '💊' },
];

export const EmployerLogos: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-lg sm:text-xl text-gray-500 mb-8">
          Trusted by companies across India / भारत भर की कंपनियों का भरोसा
        </p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <span className="text-2xl">{logo.icon}</span>
              <span className="text-lg font-semibold text-gray-700">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
