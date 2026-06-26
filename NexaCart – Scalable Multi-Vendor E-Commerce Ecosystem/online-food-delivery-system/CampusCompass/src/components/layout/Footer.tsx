import Link from "next/link";
import { Compass, Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Campus<span className="text-indigo-600">Compass</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A premium, data-driven college discovery and comparison ecosystem. Find your future campus with dynamic match scoring and predictive analytics.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Platform</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/colleges" className="hover:text-indigo-650 transition-colors">Explore Colleges</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-indigo-650 transition-colors">Comparison Matrix</Link>
              </li>
              <li>
                <Link href="/predictor" className="hover:text-indigo-650 transition-colors">Entrance Predictor</Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-indigo-650 transition-colors">Visual Analytics</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Project links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Resources & Legal</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <a href="#" className="hover:text-indigo-650 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-650 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-650 transition-colors">
                  {/* Inline GitHub SVG to prevent library version naming drift */}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-650 transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  Vercel Deployment
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <a href="mailto:support@campuscompass.ai" className="hover:text-indigo-650 transition-colors font-semibold">support@campuscompass.ai</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium">IIT Bombay Campus, Mumbai, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Sub-footer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CampusCompass. All rights reserved. Prepared for AI Software Engineer Internship.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Inspired by Careers360 & Collegedunia. Built with Next.js 15, Prisma & Tailwind v4.
          </p>
        </div>
      </div>
    </footer>
  );
}
