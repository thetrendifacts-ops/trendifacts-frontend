'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
        
        {/* Premium Logo */}
        <Link 
          href="/" 
          onClick={() => setIsMenuOpen(false)}
          className="text-2xl md:text-3xl font-extrabold tracking-tight hover:text-emerald-400 transition-colors"
        >
          Trendifacts<span className="text-emerald-500">.</span>
        </Link>

        {/* Desktop Categories */}
        <nav className="hidden md:flex gap-6 lg:gap-8 font-semibold text-sm tracking-wide text-slate-200">
          <Link href="/category/runtime-sizing-guides" className="hover:text-emerald-400 transition-colors">
            Runtime Guides
          </Link>
          <Link href="/category/gear-buying-guides" className="hover:text-emerald-400 transition-colors">
            Balcony &amp; Renter Solar
          </Link>
          <Link href="/category/outage-prep-checklists" className="hover:text-emerald-400 transition-colors">
            Outage Prep
          </Link>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-emerald-400 focus:outline-none p-2 -mr-2"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              // X (Close) Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* FULL DIRECTORY: Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-xl z-40">
          <div className="flex flex-col px-6 pt-4 pb-8 max-h-[80vh] overflow-y-auto">
            
            {/* 1. Main Directory */}
            <div className="flex flex-col gap-2 pb-6 border-b border-slate-800 font-bold text-lg text-slate-100">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors py-2">
                Home
              </Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors py-2">
                Our Methodology
              </Link>
            </div>

            {/* 2. Categories Hub */}
            <div className="flex flex-col gap-2 py-6 border-b border-slate-800 font-semibold text-slate-300">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Categories</span>
              <Link href="/category/runtime-sizing-guides" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors py-2">
                Runtime Guides
              </Link>
              <Link href="/category/gear-buying-guides" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors py-2">
                Balcony &amp; Renter Solar
              </Link>
              <Link href="/category/outage-prep-checklists" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors py-2">
                Outage Prep
              </Link>
            </div>

            {/* 3. Company & Legal */}
            <div className="flex flex-col gap-3 pt-6 font-medium text-sm text-slate-400">
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors">
                Contact Us
              </Link>
              <Link href="/privacy-policy" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="block hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}