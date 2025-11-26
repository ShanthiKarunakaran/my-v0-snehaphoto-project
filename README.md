# Sneha's Photography Website

A modern, responsive photography portfolio website built with Next.js, showcasing professional photography services and digital prints for charitable causes.

## 🌟 Features

- **Responsive Design** - Optimized for all devices and screen sizes
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Portfolio Gallery** - Showcase of photography work including portraits and prints
- **Contact Form** - Integrated contact functionality with email service
- **Charitable Mission** - Digital prints support OneProsper International
- **Performance Optimized** - Built with Next.js for fast loading and SEO
- **Accessibility** - WCAG compliant with proper semantic HTML

## 🛠️ Tech Stack

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

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── about-section.tsx # About section
│   ├── contact-section.tsx # Contact form
│   ├── footer.tsx        # Site footer
│   ├── hero-section.tsx  # Landing hero
│   ├── navigation.tsx    # Site navigation
│   └── portfolio-section.tsx # Photo gallery
├── lib/                  # Utility functions
├── public/              # Static assets
│   └── photos/         # Photography portfolio images
└── components.json      # shadcn/ui configuration
```

## 🚀 Getting Started

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

## 📸 Photography Services

- **Senior Portraits** - Professional graduation photos
- **Headshots** - Business and professional portraits  
- **Custom Portraits** - Themed photo sessions
- **Digital Prints** - High-quality downloadable images
- **Special Events** - Custom photography for occasions

## 💝 Charitable Mission

All proceeds from digital print sales are donated to **OneProsper International**, a nonprofit organization that provides:
- Educational funding for girls in India
- Housing support for low-income families
- Community development initiatives

## 🎨 Design System

The website uses a cohesive design system with:
- **Primary Color**: Purple (#6B5EA5)
- **Typography**: Geist font family with Space Grotesk headings
- **Components**: shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon set

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Enhanced layouts for tablets
- **Desktop Experience** - Full-featured desktop interface
- **Touch Friendly** - Accessible touch interactions

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

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

## 🎯 SEO & Performance

- **Next.js Optimization** - Automatic code splitting and optimization
- **Image Optimization** - Next.js Image component for fast loading
- **Meta Tags** - Proper SEO meta tags
- **Analytics** - Vercel Analytics integration
- **Core Web Vitals** - Optimized for Google's performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For questions or support regarding photography services, please use the contact form on the website or reach out directly.

---

**Built with ❤️ for capturing life's beautiful moments**