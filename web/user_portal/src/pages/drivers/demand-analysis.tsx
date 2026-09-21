import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  Clock,
  Calendar,
  MapPin,
  Compass,
  ArrowUpRight,
  Sparkles,
  Zap,
  BarChart3,
  Search,
  Filter,
  Car,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  baseMultiplier: number;
  activeRequests: number;
  peakHours: string;
  peakDays: string[];
  category: string;
}

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: 'westlands',
    name: 'Westlands & Mpaka Rd',
    lat: -1.2655,
    lng: 36.8048,
    radiusKm: 2.5,
    baseMultiplier: 1.5,
    activeRequests: 28,
    peakHours: '17:00 - 23:00',
    peakDays: ['Thursday', 'Friday', 'Saturday'],
    category: 'Nightlife & Tech Hub'
  },
  {
    id: 'cbd',
    name: 'Nairobi CBD & City Square',
    lat: -1.286389,
    lng: 36.817223,
    radiusKm: 2.0,
    baseMultiplier: 1.3,
    activeRequests: 42,
    peakHours: '07:00 - 09:30 & 16:30 - 19:30',
    peakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    category: 'Business & Commuter'
  },
  {
    id: 'kilimani',
    name: 'Kilimani & Yaya Centre',
    lat: -1.2921,
    lng: 36.7865,
    radiusKm: 2.2,
    baseMultiplier: 1.4,
    activeRequests: 22,
    peakHours: '12:00 - 14:30 & 18:00 - 21:30',
    peakDays: ['Wednesday', 'Friday', 'Saturday', 'Sunday'],
    category: 'Dining & Residential'
  },
  {
    id: 'upperhill',
    name: 'Upper Hill & Hospital Cluster',
    lat: -1.2985,
    lng: 36.8142,
    radiusKm: 2.0,
    baseMultiplier: 1.3,
    activeRequests: 18,
    peakHours: '07:30 - 09:00 & 16:30 - 19:00',
    peakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    category: 'Corporate & Medical'
  },
  {
    id: 'jkia',
    name: 'JKIA International Airport',
    lat: -1.3192,
    lng: 36.9275,
    radiusKm: 4.0,
    baseMultiplier: 1.6,
    activeRequests: 15,
    peakHours: '05:00 - 08:00 & 19:00 - 23:30',
    peakDays: ['Thursday', 'Friday', 'Sunday'],
    category: 'Airport Express'
  },
  {
    id: 'gigiri',
    name: 'Gigiri & Village Market',
    lat: -1.2333,
    lng: 36.8055,
    radiusKm: 3.0,
    baseMultiplier: 1.3,
    activeRequests: 12,
    peakHours: '11:00 - 16:00',
    peakDays: ['Friday', 'Saturday', 'Sunday'],
    category: 'Diplomatic & Shopping'
  }
];

const HOURLY_DISTRIBUTION = [
  { hour: '05:00', trips: 14, surge: 1.2, label: 'Airport Runs' },
  { hour: '06:00', trips: 28, surge: 1.3, label: 'Early Commute' },
  { hour: '07:00', trips: 48, surge: 1.5, label: 'Morning Rush' },
  { hour: '08:00', trips: 56, surge: 1.6, label: 'Morning Peak' },
  { hour: '09:00', trips: 36, surge: 1.3, label: 'Late Commute' },
  { hour: '10:00', trips: 22, surge: 1.0, label: 'Mid-Morning' },
  { hour: '11:00', trips: 24, surge: 1.1, label: 'Midday' },
  { hour: '12:00', trips: 34, surge: 1.3, label: 'Lunch Rush' },
  { hour: '13:00', trips: 31, surge: 1.2, label: 'Lunch Return' },
  { hour: '14:00', trips: 25, surge: 1.0, label: 'Early Afternoon' },
  { hour: '15:00', trips: 27, surge: 1.1, label: 'School Runs' },
  { hour: '16:00', trips: 42, surge: 1.4, label: 'Early Exit' },
  { hour: '17:00', trips: 62, surge: 1.7, label: 'Evening Peak' },
  { hour: '18:00', trips: 68, surge: 1.8, label: 'Heavy Surge' },
  { hour: '19:00', trips: 54, surge: 1.6, label: 'Dinner Rush' },
  { hour: '20:00', trips: 41, surge: 1.4, label: 'Night Dining' },
  { hour: '21:00', trips: 38, surge: 1.3, label: 'Night Transit' },
  { hour: '22:00', trips: 32, surge: 1.4, label: 'Nightlife Surge' },
  { hour: '23:00', trips: 26, surge: 1.5, label: 'Weekend Night' },
  { hour: '00:00', trips: 18, surge: 1.4, label: 'Late Lounge' },
  { hour: '01:00', trips: 12, surge: 1.3, label: 'Overnight' },
  { hour: '02:00', trips: 9, surge: 1.2, label: 'Early Flight' },
  { hour: '03:00', trips: 8, surge: 1.2, label: 'Quiet' },
  { hour: '04:00', trips: 11, surge: 1.3, label: 'Airport Dawn' }
];

const DAYS_OF_WEEK = [
  { day: 'Monday', index: 1, volume: 'High', tripsAvg: 380, peakZone: 'CBD & Upper Hill', surgeAvg: '1.4x', note: 'Strong morning commute (7-9am)' },
  { day: 'Tuesday', index: 2, volume: 'Medium-High', tripsAvg: 340, peakZone: 'CBD & Westlands', surgeAvg: '1.3x', note: 'Steady corporate transit' },
  { day: 'Wednesday', index: 3, volume: 'Medium', tripsAvg: 330, peakZone: 'Kilimani & CBD', surgeAvg: '1.3x', note: 'Mid-week dining & evening rush' },
  { day: 'Thursday', index: 4, volume: 'High', tripsAvg: 410, peakZone: 'Westlands & JKIA', surgeAvg: '1.5x', note: 'Pre-weekend business & nightlife start' },
  { day: 'Friday', index: 5, volume: 'Peak Surge', tripsAvg: 580, peakZone: 'Westlands, Kilimani & CBD', surgeAvg: '1.8x', note: 'Maximum demand 4pm to 11pm' },
  { day: 'Saturday', index: 6, volume: 'Very High', tripsAvg: 490, peakZone: 'Westlands & Shopping Hubs', surgeAvg: '1.6x', note: 'Leisure, events & nightlife throughout day' },
  { day: 'Sunday', index: 7, volume: 'Medium', tripsAvg: 290, peakZone: 'Gigiri, Karen & JKIA', surgeAvg: '1.3x', note: 'Church, family outings & airport arrivals' }
];

export default function DemandAnalysisPage() {
  const { user } = useAuth();
  const [hotspots, setHotspots] = useState<Hotspot[]>(DEFAULT_HOTSPOTS);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'hotspots' | 'hourly' | 'days'>('hotspots');

  useEffect(() => {
    fetch('http://localhost:3334/api/rides/demand-hotspots')
      .then((res) => {
        if (!res.ok) throw new Error('Network response error');
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          setHotspots(data.data);
        }
      })
      .catch((err) => {
        console.log('Using cached demand intelligence dataset:', err);
      });
  }, []);

  const filteredHotspots = hotspots.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay =
      selectedDay === 'All' || h.peakDays.includes(selectedDay);
    const matchesCategory =
      selectedCategory === 'All' ||
      h.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesDay && matchesCategory;
  });

  const maxHourlyTrips = Math.max(...HOURLY_DISTRIBUTION.map((h) => h.trips));

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yellow-500 selection:text-black">
      <Head>
        <title>Demand Intelligence & Peak Trip Analysis | Cabi Driver</title>
        <meta
          name="description"
          content="Analyze high-demand areas, peak hours, and peak days in Nairobi to maximize your driving earnings on Cabi."
        />
      </Head>

      {/* Navigation Header */}
      <header className="bg-black/90 backdrop-blur-md border-b border-neutral-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/drivers/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500">
                Cabi
              </span>
              <span className="text-neutral-500 text-sm border-l pl-2 border-neutral-800 font-medium">
                Driver Portal
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/drivers/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/drivers/demand-analysis"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-400 shadow-sm shadow-yellow-500/20"
              >
                Demand Intelligence 🔥
              </Link>
              <Link
                href="/drivers/sacco"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
              >
                SACCO Benefits
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Dispatch Feed Active
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800/80 p-6 sm:p-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Cabi Pro Market Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Trip Demand & Peak Hours Analysis
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                Strategic insights on where trips originate, peak passenger hours, and best days to drive across Nairobi. Position yourself near high-demand zones to maximize your daily revenue.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-xs font-bold mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Max Surge Potential
                </div>
                <div className="text-2xl font-black text-white">1.8x</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Fridays 17:00-22:00</div>
              </div>
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                  <Zap className="w-4 h-4" />
                  Top Hotspot
                </div>
                <div className="text-2xl font-black text-white">Westlands</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">28+ Live Requests</div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-neutral-800/80 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('hotspots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hotspots'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              High-Demand Hotspots ({hotspots.length})
            </button>
            <button
              onClick={() => setActiveTab('hourly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hourly'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Hourly Demand Curve (24h)
            </button>
            <button
              onClick={() => setActiveTab('days')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'days'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Days of Week Comparison
            </button>
          </div>
        </div>

        {/* TAB 1: HIGH DEMAND HOTSPOTS */}
        {activeTab === 'hotspots' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search areas, landmarks or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-neutral-500 flex items-center gap-1 font-semibold whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5" /> Day:
                </span>
                {['All', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      selectedDay === d
                        ? 'bg-neutral-700 text-white font-bold'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Hotspots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/90 hover:border-yellow-500/50 p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-yellow-500/90 uppercase tracking-wider block mb-1">
                          {hotspot.category}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {hotspot.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-extrabold text-xs">
                          <Flame className="w-3.5 h-3.5" />
                          {hotspot.baseMultiplier.toFixed(1)}x Surge
                        </span>
                      </div>
                    </div>

                    {/* Active Requests Pill */}
                    <div className="flex items-center gap-2 my-3 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-neutral-300">
                        <strong className="text-white font-bold">{hotspot.activeRequests}</strong> active passenger requests right now
                      </span>
                    </div>

                    {/* Peak Hours & Days */}
                    <div className="space-y-2 my-3 text-xs">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          Peak Hours:
                        </span>
                        <span className="font-semibold text-white">{hotspot.peakHours}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          Best Days:
                        </span>
                        <span className="font-semibold text-neutral-300">
                          {hotspot.peakDays.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Staging Recommendation */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Staging Radius: ~{hotspot.radiusKm} km</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      High Revenue Zone <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HOURLY DEMAND DISTRIBUTION */}
        {activeTab === 'hourly' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    24-Hour Trip Volume Distribution
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Normalized average trip volume per hour across Nairobi metropolitan area.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-yellow-400"></span>
                    <span className="text-neutral-300">High Peak Surge (&gt;1.5x)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-neutral-700"></span>
                    <span className="text-neutral-400">Standard Traffic</span>
                  </div>
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="pt-6 pb-2 overflow-x-auto">
                <div className="min-w-[700px] h-64 flex items-end gap-2 px-2 border-b border-neutral-800">
                  {HOURLY_DISTRIBUTION.map((item) => {
                    const heightPercent = (item.trips / maxHourlyTrips) * 100;
                    const isPeak = item.surge >= 1.5;
                    return (
                      <div
                        key={item.hour}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 z-20 pointer-events-none bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-center whitespace-nowrap shadow-xl">
                          <div className="text-[11px] font-black text-yellow-400">{item.hour}</div>
                          <div className="text-xs text-white font-bold">{item.trips} Trips / Hour</div>
                          <div className="text-[10px] text-orange-400 font-extrabold">{item.surge}x Surge Multiplier</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{item.label}</div>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-500 to-yellow-400 shadow-md shadow-yellow-500/20'
                              : 'bg-neutral-800 group-hover:bg-neutral-700'
                          }`}
                        ></div>
                        <span className="text-[10px] text-neutral-500 font-medium mt-2">
                          {item.hour.split(':')[0]}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Peak Window Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold mb-1">
                    <Clock className="w-4 h-4" />
                    Morning Rush (07:00 - 09:30)
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Peak demand from residential estates (Kilimani, Westlands, Kileleshwa, Karen) heading into CBD and Upper Hill commercial offices.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1">
                    <Flame className="w-4 h-4" />
                    Evening Surge (16:30 - 20:30)
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Highest daily multiplier (up to 1.8x). Office commuters returning home plus evening social diners heading to Westlands & Kilimani.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                    <Compass className="w-4 h-4" />
                    Airport Express (20:00 - 23:30)
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    High-yield long distance airport trips connecting Westlands/Gigiri hotels and international flights at JKIA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAYS OF WEEK COMPARISON */}
        {activeTab === 'days' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DAYS_OF_WEEK.map((item) => (
                <div
                  key={item.day}
                  className={`rounded-2xl border p-5 transition-all ${
                    item.volume === 'Peak Surge'
                      ? 'bg-gradient-to-b from-neutral-900 to-amber-950/30 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-black text-white">{item.day}</h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        item.volume === 'Peak Surge'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.volume}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-400 my-4">
                    <div className="flex justify-between">
                      <span>Avg Daily Requests:</span>
                      <strong className="text-white">{item.tripsAvg} trips</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Surge Multiplier:</span>
                      <strong className="text-orange-400">{item.surgeAvg}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Performing Area:</span>
                      <strong className="text-neutral-200">{item.peakZone}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                    💡 {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRO STRATEGY TIPS CARD */}
        <div className="rounded-3xl bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/30 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-yellow-400 text-black shadow-md shadow-yellow-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Driver Pro Tip: Maximize Your Daily Net Profit</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl">
                Use your <strong>Destination Mode (&ldquo;Heading Home&rdquo;)</strong> in the mobile app when wrapping up your shift so you only take paying rides that head toward your neighborhood. Combined with avoiding congested zones via the <strong>Excluded Zones filter</strong>, drivers report saving up to KES 12,000 monthly in wasted fuel.
              </p>
              <div className="pt-2">
                <Link
                  href="/drivers/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Return to Driver Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
