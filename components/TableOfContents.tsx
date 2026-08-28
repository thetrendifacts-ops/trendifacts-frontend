'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let observer;

    // Wrap the initialization in a function so we can retry it
    const initToc = () => {
      const article = document.getElementById('article-content');
      if (!article) return false;

      // Included h1 just in case WordPress uses them for sub-headings
      const elements = Array.from(article.querySelectorAll('h1, h2, h3'));
      if (elements.length === 0) return false;

      const toc = elements.map((el) => {
        const id = el.innerText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        
        el.id = id;
        
        return {
          id,
          text: el.innerText,
          level: el.tagName === 'H3' ? 3 : 2, // Group H1 and H2 together at the top level
        };
      });

      setHeadings(toc);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '0px 0px -80% 0px' } 
      );

      elements.forEach((el) => observer.observe(el));
      return true;
    };

    // 1. Try to find the headings immediately
    const success = initToc();

    // 2. If Next.js hasn't injected the HTML yet, wait 250ms and try again
    let fallbackTimer;
    if (!success) {
      fallbackTimer = setTimeout(initToc, 250);
    }

    return () => {
      if (observer) observer.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-t-4 border-t-emerald-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900">Table of Contents</h3>
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
      
      {/* Added max-height and overflow-y-auto so long lists scroll internally */}
      <nav className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        <ul className="flex flex-col gap-3 text-sm font-medium">
          {headings.map((heading) => (
            <li 
              key={heading.id} 
              style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(heading.id);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block transition-all duration-200 border-l-2 pl-3 ${
                  activeId === heading.id 
                    ? 'border-emerald-500 text-emerald-600 font-bold' 
                    : 'border-transparent text-slate-600 hover:text-emerald-600 hover:border-slate-300'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}