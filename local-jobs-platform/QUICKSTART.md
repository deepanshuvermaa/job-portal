# Quick Start Guide - LocalJobs Platform

## 🚀 Get Started in 5 Minutes

### Step 1: Open the Application

The development server is already running at:
```
http://localhost:5174
```

### Step 2: Test the Authentication Flow

1. **Language Selection**
   - Choose **हिंदी (Hindi)** or **English**
   - Hindi is the default for Tier 2/3 city users

2. **Phone Authentication**
   - Enter any 10-digit mobile number (starting with 6-9)
   - Example: `9876543210`
   - Click "Send OTP"

3. **Enter OTP**
   - Check the browser console (F12) for the generated OTP
   - Or use the demo OTP: `123456`
   - Click "Verify OTP"

4. **Select Role**
   - Choose "Hire Workers" (Employer)
   - Or "Find Jobs" (Worker)

### Step 3: Explore the Platform

Currently implemented:
- ✅ Language selection (Hindi/English)
- ✅ Phone OTP authentication
- ✅ Role selection
- ✅ Responsive UI with Tailwind CSS
- ✅ State management with Zustand

Coming next:
- 📝 Employer signup form
- 👤 Worker profile creation
- 💼 Job posting interface
- 🔍 Job discovery feed

## 📂 Project Structure Overview

```
src/
├── components/shared/   ← Reusable UI components (Button, Input, Card, etc.)
├── pages/              ← Main pages (Auth, Dashboard, etc.)
├── store/              ← Zustand state stores (auth, app settings)
├── types/              ← TypeScript definitions
├── utils/              ← Helper functions, constants, translations
└── App.tsx             ← Main routing
```

## 🎨 Key Features Implemented

### 1. Multi-Language Support
- Hindi (default) and English
- All UI elements translated
- Easy to add more regional languages

### 2. Type-Safe Development
- Full TypeScript support
- Comprehensive type definitions for all entities
- Auto-completion in VSCode

### 3. Mobile-First Design
- Large, touch-friendly buttons
- High contrast for readability
- Icon-heavy interface

### 4. State Management
- Zustand for lightweight state
- Persistent storage (localStorage)
- Auth state management

## 🔧 Development Tips

### Adding a New Component

```typescript
// src/components/shared/MyComponent.tsx
import React from 'react';
import { cn } from '../../utils/helpers';

interface MyComponentProps {
  // props
}

export const MyComponent: React.FC<MyComponentProps> = ({ ... }) => {
  return <div>...</div>;
};
```

### Adding a New Page

```typescript
// src/pages/MyPage.tsx
import React from 'react';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../utils/translations';

export const MyPage: React.FC = () => {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  return <div>{t('common.appName')}</div>;
};
```

### Adding Translations

Edit `src/utils/translations.ts`:

```typescript
export const translations = {
  en: {
    mySection: {
      myKey: 'My English Text',
    },
  },
  hi: {
    mySection: {
      myKey: 'मेरा हिंदी टेक्स्ट',
    },
  },
};
```

Use in component:
```typescript
const { t } = useTranslation(language);
t('mySection.myKey')
```

## 📝 Next Implementation Steps

### For Employer Flow:
1. Create `EmployerSignup.tsx` page
2. Build form with:
   - Business type selection
   - Business name
   - Location picker
   - Proof upload
3. Handle verification status

### For Worker Flow:
1. Create `WorkerSignup.tsx` page
2. Build profile form with:
   - Skill selection (checkboxes)
   - Experience level
   - Availability options
   - Language selection
3. Optional voice intro

### For Job Posting:
1. Create `JobPostForm.tsx` component
2. Fields:
   - Job category (dropdown)
   - Work type (full-time/part-time/daily)
   - Salary range
   - Location
   - Requirements (checkboxes)
   - Benefits

## 🎯 Design Guidelines

### Button Hierarchy
```tsx
// Primary action
<Button variant="primary">Apply Now</Button>

// Secondary action
<Button variant="secondary">View Details</Button>

// Destructive action
<Button variant="danger">Delete Job</Button>
```

### Form Layout
- Use `Input` component for text fields
- Use `Select` component for dropdowns
- Always provide labels
- Show error messages below fields
- Large touch targets (min 48px height)

### Colors
- Primary: Blue (#0ea5e9)
- Success: Green
- Warning: Yellow
- Danger: Red
- Gray: For neutral elements

### Icons
- Use Lucide React icons
- Size: w-5 h-5 for inline, w-8 h-8 for headers
- Always pair with text labels

## 🐛 Troubleshooting

### Port Already in Use
The app automatically finds an available port. Check terminal for the actual URL.

### TypeScript Errors
Run type check:
```bash
npm run type-check
```

### Styles Not Applying
Ensure Tailwind classes are in the safelist or restart dev server:
```bash
# Stop current server
Ctrl+C

# Restart
npm run dev
```

## 📚 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

## 💡 Pro Tips

1. **Use Components**: Reuse shared components for consistency
2. **Translation First**: Always add both Hindi and English
3. **Mobile Test**: Test on mobile viewport (DevTools)
4. **State Management**: Use Zustand stores for shared state
5. **Type Safety**: Define interfaces before implementing

## 🤝 Need Help?

- Check the main README.md for detailed documentation
- Review existing components for patterns
- TypeScript errors? Check types/index.ts
- UI issues? Review Tailwind classes

---

Happy Coding! 🎉

**Building for Bharat's local workforce** 🇮🇳
