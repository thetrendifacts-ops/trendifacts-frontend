import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Condensed Legal Disclaimer */}
        <div className="text-sm md:w-2/3 leading-relaxed">
          <p className="text-slate-400 font-medium">
            <span className="font-bold text-white tracking-wide">AFFILIATE DISCLOSURE: </span> 
            As an Amazon Associate, Trendifacts earns from qualifying purchases.
          </p>
        </div>

        {/* Essential Links & Copyright */}
        <div className="text-sm md:w-1/3 flex flex-col items-start md:items-end gap-3">
          <div className="flex flex-wrap md:justify-end gap-4 font-medium text-slate-200">
            <Link href="/about" className="hover:text-emerald-400 transition-colors">Methodology</Link>
            <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
          </div>
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Trendifacts. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}