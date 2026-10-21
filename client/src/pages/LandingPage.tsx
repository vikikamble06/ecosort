import React, { useState } from 'react';
import { 
  ScanLine, 
  MapPin, 
  CalendarClock, 
  Award, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Recycle, 
  ShieldCheck, 
  Leaf, 
  Layers, 
  Cpu, 
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI Waste Scanner identify what I'm throwing away?",
      a: "EcoSort analyzes uploaded images using deterministic semantic matching mapped to an extensive waste knowledge base. In cloud-connected environments, it connects to computer vision APIs. In offline or competition demo mode, it uses transparent rule-based classification with sample catalogues and filename hints, with zero fabricated confidence scores."
    },
    {
      q: "What makes EcoSort different from generic recycling charts?",
      a: "Unlike generic static posters, EcoSort gives you item-specific decisions ('What Should I Do With This?'), accounts for local municipal rules, provides strict safety warnings for hazardous materials like lithium batteries, and calculates real environmental diversion metrics in an auditable ledger."
    },
    {
      q: "Can I book a doorstep pickup for bulk recyclables and e-waste?",
      a: "Yes! EcoSort features a complete pickup scheduling workflow. Select your waste category, specify estimated weight, choose a verified time slot, and receive an instant booking reference (e.g. ECO-2026-8941) with real-time status tracking."
    },
    {
      q: "How are EcoPoints calculated and how do you prevent fake submissions?",
      a: "Points are recorded in a tamper-resistant relational ledger with database-enforced unique constraints (user_id, event_type, reference_id). You cannot earn duplicate points by repeatedly uploading or confirming the same event."
    },
    {
      q: "Is my personal address or location shared publicly?",
      a: "Never. Privacy and cybersecurity are core requirements. Addresses and phone numbers are encrypted on the server, sanitized in API responses, and never exposed on public leaderboards (which use privacy-masked names like 'Priya S.')."
    }
  ];

  return (
    <div className="flex-1 bg-[#fcfbf9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-emerald-100 bg-gradient-to-b from-emerald-50/50 via-white to-[#fcfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
                <Sparkles size={14} className="text-emerald-600" />
                <span>Next-Gen Circular Sustainability Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-950 leading-[1.12]">
                Waste Less. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700">
                  Sort Smarter.
                </span> <br />
                Live Greener.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Transform the question <em>"Where should I throw this?"</em> into an intelligent, guided disposal decision. Identify waste with AI, discover certified recyclers, schedule doorstep pickups, and measure your verifiable environmental impact.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('scanner')}
                  className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/25 transition flex items-center gap-2 group text-sm"
                >
                  <ScanLine size={18} className="group-hover:rotate-6 transition" />
                  <span>Identify My Waste</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => onNavigate('locator')}
                  className="px-6 py-3.5 bg-white hover:bg-gray-50 text-emerald-950 font-bold rounded-xl border border-emerald-200 shadow-sm transition flex items-center gap-2 text-sm"
                >
                  <MapPin size={18} className="text-emerald-600" />
                  <span>Explore Recycling</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>11 Standard Categories</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Verified Disposal Rules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Zero Fake AI Claims</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Scanner Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100/80 glow-emerald">
                {/* Decorative header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Live Scanner Simulation</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>

                {/* Simulated Scan Result */}
                <div className="mt-5 space-y-4 text-left">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-4 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Identified Item</span>
                        <h4 className="text-lg font-bold">PET Plastic Water Bottle</h4>
                        <p className="text-xs text-gray-400">Resin Code #1 (Polyethylene Terephthalate)</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                        96% Match
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Recommended Bin:</span>
                      <span className="font-bold text-teal-400 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Blue Plastic Bin
                      </span>
                    </div>
                  </div>

                  {/* Preparation action card */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <Leaf size={14} className="text-emerald-600" /> Preparation Instructions:
                    </div>
                    <p className="text-gray-700 text-[11px] leading-relaxed">
                      1. Empty all liquid contents.<br />
                      2. Rinse lightly with cold water.<br />
                      3. Crush bottle to conserve bin volume and replace screw cap.
                    </p>
                  </div>

                  {/* Impact preview */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">EcoPoints</div>
                      <div className="text-base font-extrabold text-emerald-700">+10 Points</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">Recyclability</div>
                      <div className="text-base font-extrabold text-teal-700">100% Recyclable</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('scanner')}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Try With Your Waste Item</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Impact Metrics Ticker */}
      <section className="py-8 bg-emerald-900 text-white border-y border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300">24,850+</div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">Verified Items Sorted</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-300">12.4 Tons</div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">Diverted from Landfills</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300">1,840+</div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">Active Citizens Enrolled</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-300">17.3 Tons</div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">CO₂e Emissions Avoided</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Simple Steps) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Intuitive Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            How EcoSort Powers Circular Recycling
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Four simple steps turn everyday discard confusion into actionable, measurable sustainability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {[
            {
              step: '01',
              title: 'Photograph or Search',
              desc: 'Upload a picture of any discard or look it up in our instant waste knowledge base.',
              icon: ScanLine,
              color: 'text-emerald-600 bg-emerald-50'
            },
            {
              step: '02',
              title: 'Get Guided Decision',
              desc: 'Receive exact bin requirements, preparation steps, and safety warnings for hazardous materials.',
              icon: Recycle,
              color: 'text-teal-600 bg-teal-50'
            },
            {
              step: '03',
              title: 'Recycle or Schedule',
              desc: 'Find certified recycling centers or schedule a doorstep pickup for bulk dry waste and e-waste.',
              icon: CalendarClock,
              color: 'text-blue-600 bg-blue-50'
            },
            {
              step: '04',
              title: 'Earn & Track Impact',
              desc: 'Earn tamper-proof EcoPoints, unlock sustainability badges, and measure your diverted mass.',
              icon: Award,
              color: 'text-amber-600 bg-amber-50'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <span className="text-4xl font-black text-gray-100 absolute top-4 right-4">{item.step}</span>
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-emerald-50/40 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Full Feature Suite
            </span>
            <h2 className="text-3xl font-extrabold text-emerald-950">
              Designed for Real-World Environmental Action
            </h2>
            <p className="text-sm text-gray-600">
              Every tool a citizen, institution, or municipal administrator needs to achieve high segregation rates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'AI & Deterministic Scanner',
                desc: 'Upload images or select curated samples. Clear, transparent labeling between AI cloud models and offline deterministic knowledge rules.',
                tab: 'scanner',
                icon: ScanLine,
                badge: 'Core Feature'
              },
              {
                title: 'Smart Disposal Guide',
                desc: 'Over 35+ items categorized with preparation steps, recyclability index, and local municipal regulations.',
                tab: 'knowledge',
                icon: Leaf,
                badge: 'Instant Search'
              },
              {
                title: 'Recycling Facility Directory',
                desc: 'Locate authorized composting hubs, e-waste centers, plastic recyclers, and hazardous depots with operating hours.',
                tab: 'locator',
                icon: MapPin,
                badge: 'Verified Hubs'
              },
              {
                title: 'Doorstep Pickup Booking',
                desc: 'Book verified doorstep recycling collections. Rejects past dates, prevents double-booking, and issues reference numbers.',
                tab: 'pickup',
                icon: CalendarClock,
                badge: 'Self-Service'
              },
              {
                title: 'Auditable EcoPoints Ledger',
                desc: 'Earn gamified rewards without misleading claims. Backed by a relational database ledger that prevents duplicate awards.',
                tab: 'impact',
                icon: Award,
                badge: 'Anti-Cheat'
              },
              {
                title: 'Role-Based Admin Console',
                desc: 'Moderation portal for municipality coordinators. Update pickup statuses, manage waste items, and review audit logs.',
                tab: 'admin',
                icon: ShieldCheck,
                badge: 'Secure RBAC'
              }
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={i} 
                  onClick={() => onNavigate(feat.tab)}
                  className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore feature</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Segregation Guide Section (Wet vs Dry vs E-Waste vs Hazardous) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 text-left">
        <div className="max-w-2xl mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Waste Stream Segregation
          </span>
          <h2 className="text-3xl font-extrabold text-emerald-950">
            Why Source Segregation Matters
          </h2>
          <p className="text-sm text-gray-600">
            Contamination is the #1 enemy of recycling. Mixing wet organic waste with clean dry cardboard destroys recyclability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-green-50/70 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <h3 className="font-bold text-sm text-green-950">Wet / Organic Waste</h3>
            </div>
            <p className="text-xs text-green-900/80 mb-3 leading-relaxed">
              Fruit peels, vegetable scraps, leftover food, coffee grounds, and garden clippings.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-green-200 text-[11px] font-semibold text-green-800">
              Bin: Green Compost Bin
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-sky-600" />
              <h3 className="font-bold text-sm text-sky-950">Dry Recyclables</h3>
            </div>
            <p className="text-xs text-sky-900/80 mb-3 leading-relaxed">
              Clean paper, corrugated cartons, PET bottles, aluminium cans, and clean glass jars.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-sky-200 text-[11px] font-semibold text-sky-800">
              Bin: Blue Dry Bin
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <h3 className="font-bold text-sm text-purple-950">Electronic Waste</h3>
            </div>
            <p className="text-xs text-purple-900/80 mb-3 leading-relaxed">
              Old phones, chargers, laptops, circuit boards, and broken household electronics.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-purple-200 text-[11px] font-semibold text-purple-800">
              Bin: Dedicated E-Waste Depot
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <h3 className="font-bold text-sm text-red-950">Hazardous & Batteries</h3>
            </div>
            <p className="text-xs text-red-900/80 mb-3 leading-relaxed">
              Lithium batteries, CFL bulbs, aerosol cans, leftover paints, and expired medicines.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-red-200 text-[11px] font-semibold text-red-800">
              Bin: Red Hazardous Drop-Off
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-white border-t border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Questions & Answers
            </span>
            <h2 className="text-3xl font-extrabold text-emerald-950">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-gray-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-gray-900 hover:bg-gray-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-emerald-700" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 text-white pt-12 pb-8 border-t border-emerald-900 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Recycle size={18} />
                </div>
                <span className="font-extrabold text-lg text-white">Eco<span className="text-emerald-400">Sort</span></span>
              </div>
              <p className="text-emerald-200/70 leading-relaxed">
                Smart waste segregation, automated AI classification, certified recycling locator, and doorstep pickup scheduling.
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">Competition Ready • Zero Fabrication</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Core Features</h4>
              <ul className="space-y-2 text-emerald-200/70">
                <li><button onClick={() => onNavigate('scanner')} className="hover:text-white">AI Waste Scanner</button></li>
                <li><button onClick={() => onNavigate('knowledge')} className="hover:text-white">Disposal Knowledge Base</button></li>
                <li><button onClick={() => onNavigate('locator')} className="hover:text-white">Recycling Center Locator</button></li>
                <li><button onClick={() => onNavigate('pickup')} className="hover:text-white">Doorstep Pickup Scheduler</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Integrity & Standards</h4>
              <ul className="space-y-2 text-emerald-200/70">
                <li><span>IPCC Solid Waste Emission Factors</span></li>
                <li><span>NIST-Grade Cryptographic Security</span></li>
                <li><span>Database Unique Constraints</span></li>
                <li><span>Transparent AI Provider Mode</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Demo Access</h4>
              <p className="text-emerald-200/70 leading-relaxed mb-3">
                Pre-configured sample accounts available for competition evaluation:
              </p>
              <div className="p-2.5 rounded bg-emerald-900/50 border border-emerald-800 text-[11px] space-y-1 font-mono">
                <div>Citizen: <span className="text-emerald-300">demo@ecosort.org</span></div>
                <div>Admin: <span className="text-purple-300">admin@ecosort.org</span></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300/60 gap-3">
            <p>© 2026 EcoSort Platform. Developed for Competition Demonstration.</p>
            <p>Environmental Impact calculated from logged items & verified recycling conversion standards.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
