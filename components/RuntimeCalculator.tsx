'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RuntimeCalculator() {
  const [watts, setWatts] = useState<number | ''>('');

  const getRecommendation = (watts: number) => {
    if (watts <= 0) return null;
    
    // Low draw: Routers, CPAP (humidifier off), small fans
    if (watts <= 100) {
      return {
        tier: 'Lightweight Portable',
        model: 'EcoFlow River 2 / Jackery 300 Plus',
        capacity: 300, // Wh
        desc: 'Perfect for keeping essentials running overnight without breaking the bank.',
        affiliateUrl: '/ecoflow-river-2-review', // Link to your review/affiliate
      };
    } 
    // Medium draw: Fridge, TV, CPAP (humidifier on)
    else if (watts <= 800) {
      return {
        tier: 'Mid-Size Home Backup',
        model: 'EcoFlow Delta 2 / Jackery 1000 v2',
        capacity: 1000,
        desc: 'The sweet spot. Easily keeps a full-size fridge cold during prolonged blackouts.',
        affiliateUrl: '/jackery-1000-vs-1500',
      };
    } 
    // High draw: Space heaters, window AC, heavy tools
    else {
      return {
        tier: 'Heavy-Duty Off-Grid',
        model: 'EcoFlow Delta Pro / Bluetti AC200P',
        capacity: 3600,
        desc: 'Built for high-surge appliances like space heaters and window AC units.',
        affiliateUrl: '/ecoflow-delta-pro-review',
      };
    }
  };

  const recommendation = typeof watts === 'number' ? getRecommendation(watts) : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 my-8 shadow-xl text-white not-prose border border-slate-700">
      <h3 className="text-2xl font-bold mb-2">⚡ Power Station Size Calculator</h3>
      <p className="text-slate-300 mb-6 text-sm">
        Enter your appliance's wattage to see exactly which portable power station you need.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="number"
            min="1"
            placeholder="e.g. 600"
            value={watts}
            onChange={(e) => setWatts(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 pl-16 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-lg font-medium transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            Watts
          </span>
        </div>
      </div>

      {recommendation && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            Recommended Tier: {recommendation.tier}
          </div>
          <div className="text-xl font-black text-white mb-2">
            {recommendation.model}
          </div>
          <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm">
            <span>Estimated Runtime:</span>
            <span className="font-bold text-white bg-slate-700 px-2 py-1 rounded">
              {((recommendation.capacity * 0.85) / (watts as number)).toFixed(1)} Hours
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-5">{recommendation.desc}</p>
          <Link
            href={recommendation.affiliateUrl}
            className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Check Price & Availability &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}