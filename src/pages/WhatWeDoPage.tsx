import React from 'react';
import { 
  Sparkles, 
  Camera, 
  Layers, 
  Award, 
  Users, 
  Star, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface WhatWeDoPageProps {
  setActiveTab: (tab: string) => void;
}

export default function WhatWeDoPage({ setActiveTab }: WhatWeDoPageProps) {
  const activities = [
    {
      id: 'fashion-shows',
      title: 'Fashion Shows & Ramp Productions',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      description: 'We conceive, produce and execute high-energy fashion runway shows across premier city-center auditoriums. Our productions feature state-of-the-art intelligent lighting, bespoke catwalk staging, crystal-clear acoustics, and curated media seating to give every contestant an unforgettable catwalk moment.',
      features: [
        'Professional audio, stage lighting & ramp choreography',
        'Seated audience including fashion industry delegates and families',
        'Official videography and multi-angle camera coverage',
      ],
      image: '/images/runway-1.jpg',
    },
    {
      id: 'runway-experiences',
      title: 'Authentic Runway Experiences',
      icon: Camera,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      description: 'Walking a ramp is an art of poise, rhythm, and self-belief. Our runway experiences provide both first-timers and experienced models with a genuine catwalk setting where they can showcase garments, express their personality, and receive impartial evaluations from fashion professionals.',
      features: [
        'Dedicated solo and group ramp routines',
        'Constructive feedback on posture and walk dynamics',
        'Stage confidence building in front of live crowds',
      ],
      image: '/images/runway-2.jpg',
    },
    {
      id: 'model-opportunities',
      title: 'Model Opportunities & Talent Auditions',
      icon: Star,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      description: 'SKYRA CREATIONS creates accessible pathways for emerging models. We eliminate predatory fees and confusing contracts by hosting structured auditions with clear participation guidelines, verifiable digital passes, and transparent advance tokens.',
      features: [
        'Verifiable digital contestant passes & credential validation',
        'Official certificates of participation for all stage walkers',
        'Exposure to regional fashion scouts and casting directors',
      ],
      image: '/images/runway-3.jpg',
    },
    {
      id: 'designer-showcases',
      title: 'Designer Showcases & Label Features',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      description: 'We collaborate with innovative apparel creators, bridal designers, ethnic wear labels, and contemporary fashion houses to showcase their collections on vibrant runway models. Each showcase is styled to accentuate garment cuts, drape, and theme.',
      features: [
        'Curated theme styling matching garment aesthetics',
        'High-resolution imagery for designer lookbooks',
        'Collaborative fitting sessions prior to ramp walk',
      ],
      image: '/images/runway-1.jpg',
    },
    {
      id: 'grooming',
      title: 'Grooming & Stage Preparation Workshops',
      icon: Award,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/30',
      description: 'Before stepping onto the catwalk, contestants receive practical guidance on runway turns, facial poise, pacing, and wardrobe handling. Rehearsals ensure every walker feels confident and prepared for their time under the lights.',
      features: [
        'Ramp walk technique and pivot turn practice',
        'Personal grooming tips and makeup alignment',
        'Timing synchronization with show music',
      ],
      image: '/images/runway-2.jpg',
    },
    {
      id: 'collaborations',
      title: 'Creative Industry Collaborations',
      icon: Users,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/30',
      description: 'Fashion thrives on collaboration. SKYRA CREATIONS works alongside leading hair and makeup artists (HMUA), fashion cinematographers, event organizers, and choreographers to produce spectacles that uplift the creative community.',
      features: [
        'Networking for makeup artists and stylists',
        'Backstage creative management and coordination',
        'Cross-promotional features on official social media channels',
      ],
      image: '/images/runway-3.jpg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest inline-block">
          What We Do
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
          Comprehensive Fashion Show &amp; Runway Productions
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
          From stage choreography and model grooming to full-scale runway productions and designer showcases, discover how SKYRA CREATIONS brings fashion to life.
        </p>
      </div>

      {/* Activities Grid */}
      <div className="space-y-12">
        {activities.map((item, index) => {
          const Icon = item.icon;
          const isEven = index % 2 === 0;

          return (
            <div 
              key={item.id}
              className={`p-6 sm:p-10 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                !isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-7 space-y-4 ${!isEven ? 'lg:order-2' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                  {item.description}
                </p>

                <div className="space-y-2 pt-2">
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-5 ${!isEven ? 'lg:order-1' : ''}`}>
                <div className="rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-xl group">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#d4ff14]/10 to-amber-500/10 border border-amber-500/30 text-center space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Experience a SKYRA CREATIONS Runway Show
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
          Explore upcoming events and register to participate as a contestant in Chennai.
        </p>
        <button
          onClick={() => setActiveTab('events')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
        >
          <span>Explore Upcoming Events</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
