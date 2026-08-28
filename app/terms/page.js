import { getPageByUri } from '../../lib/api';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Terms & Conditions | Trendifacts',
};

export default async function PrivacyPolicyPage() {
  // Pass the exact WordPress slug for this page
  const page = await getPageByUri('terms-and-conditions');

  if (!page) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 pb-8 border-b border-slate-100">
          {page.title}
        </h1>
        
        {/* Render the WordPress page content */}
        <div 
          className="prose prose-lg max-w-none prose-slate prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </main>
  );
}