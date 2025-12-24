# Photography Web App

A modern, responsive photography Web App built with Next.js, showcasing professional photography portfolio and services for charitable causes.

## Features

- **Responsive Design** - Optimized for all devices and screen sizes
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Portfolio Gallery** - Showcase of photography work with category filtering and pagination
- **Contact & Donate Sections** - Separated contact form and donation information
- **Smooth Scroll Navigation** - Fixed header with offset-aware smooth scrolling
- **Donation Tracking** - Real-time display of funds raised ($341 of $5000 goal)
- **Contact Form** - Integrated contact functionality with email service (Resend)
- **Testimonials Section** - Client testimonials and reviews
- **Charitable Mission** - Digital prints support OneProsper International
- **Performance Optimized** - Built with Next.js for fast loading and SEO
- **Accessibility** - WCAG compliant with proper semantic HTML

## Tech Stack

### Core Framework
- **Next.js 15.5.4** - React-based full-stack framework
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe development

### Styling & UI
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible headless UI primitives
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icon library

### Form & Validation
- **React Hook Form** - Efficient form handling
- **Zod** - Type-safe schema validation
- **Resend** - Email service integration

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── actions/                 # Server actions
│   ├── admin/                   # Admin pages for content management
│   │   ├── page.tsx            # Admin dashboard
│   │   └── update-urls/        # URL update utilities
│   ├── api/                     # API routes
│   │   ├── contact/            # Contact form submission
│   │   ├── images/             # Image fetching and management
│   │   ├── categories/         # Category management
│   │   ├── upload/             # Image upload
│   │   ├── download-zip/       # Bulk download functionality
│   │   └── admin/              # Admin authentication
│   ├── techniques/              # Photography techniques page
│   ├── globals.css              # Global styles with scroll-padding
│   ├── layout.tsx               # Root layout with SmoothScrollHandler
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   ├── textarea.tsx        # Textarea component
│   │   ├── film-strip.tsx      # Decorative film strip
│   │   ├── theme-toggle.tsx    # Dark/light theme toggle
│   │   └── smart-oneprosper-link.tsx # OneProsper link component
│   ├── about-section.tsx        # About section with mission
│   ├── contact-section.tsx      # Contact form + Donate column
│   ├── donate-section.tsx       # Standalone donate section (optional)
│   ├── footer.tsx               # Site footer with navigation
│   ├── hero-section.tsx         # Landing hero with CTA
│   ├── navigation.tsx           # Fixed navigation bar
│   ├── portfolio-section.tsx    # Photo gallery with filtering
│   ├── smooth-scroll-handler.tsx # Global smooth scroll handler
│   └── testimonials-section.tsx # Client testimonials
├── lib/                         # Utility functions
│   └── utils.ts                # Utility functions (cn, etc.)
├── public/                      # Static assets
│   └── photos/                 # Photography portfolio images
│       ├── Portraits/          # Portrait photography
│       ├── aboutMe/            # About section images
│       └── ...                 # Other categories
└── components.json              # shadcn/ui configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-v0-snehaphoto-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   touch .env.local
   ```
   
   Add your environment variables:
   ```env
   RESEND_API_KEY=your_resend_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_PASSWORD=your_secure_admin_password
   ```
   
   **Important**: Set a strong `ADMIN_PASSWORD` to protect the admin page at `/admin`. This password is required to upload images and manage the portfolio.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Photography Services

The website offers the following photography services (selectable via radio buttons in the contact form):

- **Senior Portraits** - Professional graduation photos
- **Headshots** - Business and professional portraits  
- **Portrait Session** - General portrait photography
- **Graduation Photos** - Commencement and graduation events
- **Family Photos** - Family portrait sessions
- **Event Photography** - Special events and occasions
- **Other** - Custom photography services (specify in message)

## Charitable Mission

All proceeds from digital print sales and direct donations are donated to **OneProsper International**, a nonprofit organization that provides:
- Educational funding for girls in India
- Housing support for low-income families
- Community development initiatives

### Donation Tracking
- **Current Goal**: $5,000
- **Amount Raised**: $341 (displayed in Hero and Donate sections)
- **Donation Methods**: PayPal (paypal.me/ShanthiKarunakaran)
- **100% of donations** go directly to OneProsper International

## Design System

The website uses a cohesive design system with:

### Colors
- **Primary Color**: Red Orange (#DC4731) - Used for CTAs, links, and accents
- **Secondary Color**: Burnt Orange (#B8390E) - Used for secondary elements
- **Background**: Cream (#FFF3D9) - Main background color
- **Foreground**: Rose Red (#3B0918) - Main text color
- **Accent**: Rose Red (#3B0918) - Accent elements
- **Theme Support**: Dark/light mode with system preference detection

### Typography
- **Headings**: Space Grotesk (via CSS variable `--font-space-grotesk`)
- **Body Text**: DM Sans (via CSS variable `--font-dm-sans`)
- **Font Loading**: Optimized with `display: swap` for performance

### Components
- **UI Library**: shadcn/ui component library
- **Base Components**: Button, Input, Textarea with consistent styling
- **Custom Components**: Film strip decorations, theme toggle, smart links

### Navigation & Scrolling
- **Fixed Header**: 64px (4rem) fixed navigation bar
- **Smooth Scrolling**: Custom scroll handler with offset calculation
- **Hash Navigation**: URL hash-based section navigation
- **Scroll Padding**: `scroll-padding-top: 4rem` to account for fixed header

### Layout Structure
- **Hero Section**: Landing page with CTA buttons and donation stat
- **Portfolio Section**: Image gallery with category filtering and pagination
- **About Section**: Mission statement and services overview
- **Testimonials Section**: Client reviews and feedback
- **Contact Section**: Two-column layout
  - **Left Column**: Contact form with name, email, photoshoot type (radio), message
  - **Right Column**: Donate section with PayPal button, donation stats, and information
- **Footer**: Social links, navigation, and OneProsper link

### Form Design
- **Contact Form**: Clean, accessible form with validation
- **Photoshoot Selection**: Radio buttons (single selection) for service type
- **Form Validation**: Client-side and server-side validation
- **Honeypot Field**: Bot protection with hidden website field

### Animations
- **Smooth Transitions**: CSS transitions for hover states
- **Scroll Animations**: Smooth scroll behavior for navigation
- **Visual Feedback**: Highlight effects on form focus and section navigation

### Icons
- **Icon Library**: Lucide React icon set
- **Usage**: Navigation, social links, form elements, decorative elements

## Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Enhanced layouts for tablets
- **Desktop Experience** - Full-featured desktop interface
- **Touch Friendly** - Accessible touch interactions

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

##  Deployment

The project is optimized for deployment on **Vercel**:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

Alternative deployment platforms:
- Netlify
- AWS Amplify
- Railway

## 📧 Contact Integration

The contact form uses Resend for reliable email delivery. To set up:

1. Create a Resend account
2. Generate an API key
3. Add to environment variables
4. Configure your domain for production

### Contact Form Features
- **Field Validation**: Name, email, and message validation
- **Photoshoot Type**: Radio button selection (single choice)
- **Spam Protection**: Honeypot field and rate limiting
- **Success/Error Messages**: User-friendly feedback
- **Form Reset**: Automatic form clearing on successful submission

### Donation Integration
- **PayPal Integration**: Direct links to PayPal.me
- **Donation Tracking**: Manual updates to display current amount raised
- **Goal Display**: Shows progress toward $5,000 goal
- **Secure Processing**: All donations processed through PayPal

## 🎯 SEO & Performance

- **Next.js Optimization** - Automatic code splitting and optimization
- **Image Optimization** - Next.js Image component for fast loading
- **Meta Tags** - Proper SEO meta tags
- **Analytics** - Vercel Analytics integration
- **Core Web Vitals** - Optimized for Google's performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is private and proprietary. All rights reserved.

## Support

For questions or support regarding photography services, please use the contact form on the website or reach out directly.

---

**Built with ❤️ for capturing life's beautiful moments**