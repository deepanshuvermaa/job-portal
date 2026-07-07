import React from 'react';
import { Briefcase } from 'lucide-react';

const footerLinks: Record<string, string[]> = {
  'Popular Cities': [
    'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad',
  ],
  'Job Categories': [
    'Delivery Jobs', 'Driver Jobs', 'Helper Jobs', 'Mechanic Jobs',
    'Cook Jobs', 'Security Guard Jobs', 'Sales Jobs', 'Electrician Jobs',
  ],
  'For Workers': [
    'Find Jobs', 'Create Profile', 'Job Alerts', 'Salary Guide',
  ],
  'For Employers': [
    'Post a Job', 'Browse Workers', 'Pricing', 'Templates',
  ],
};

export const SEOFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-base font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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
        </div>
      </div>
    </footer>
  );
};
