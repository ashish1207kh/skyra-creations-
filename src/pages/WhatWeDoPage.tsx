import React from 'react';
import { 
  Sparkles, 
  Camera, 
  Layers, 
  Award, 
  Users, 
  Star, 
  ArrowRight,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import MagneticButton from '../components/MagneticButton';
import TiltCard from '../components/TiltCard';

interface WhatWeDoPageProps {
  setActiveTab: (tab: string) => void;
}

export default function WhatWeDoPage({ setActiveTab }: WhatWeDoPageProps) {
  const activities = [
    {
      id: 'fashion-shows',
      number: '01',
      title: 'Fashion Shows & Ramp Productions',
      category: 'PRODUCTION',
      icon: Sparkles,
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
      number: '02',
      title: 'Authentic Runway Experiences',
      category: 'CATWALK',
      icon: Camera,
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
      number: '03',
      title: 'Model Opportunities & Talent Auditions',
      category: 'OPPORTUNITY',
      icon: Star,
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
      number: '04',
      title: 'Designer Showcases & Label Features',
      category: 'COUTURE',
      icon: Layers,
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
      number: '05',
      title: 'Grooming & Stage Preparation Workshops',
      category: 'MENTORSHIP',
      icon: Award,
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
      number: '06',
      title: 'Creative Industry Collaborations',
      category: 'INDUSTRY',
      icon: Users,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest text-[#C6FF00]">
          OUR DISCIPLINES & EXPERTISE
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white">
          WHAT WE CREATE.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed text-[#BFC3C7]">
          From stage choreography and model grooming to full-scale runway productions and designer showcases, discover how SKYRA CREATIONS brings fashion to life on the catwalk.
        </p>
      </motion.div>

      {/* Activities Grid */}
      <div className="space-y-16">
        {activities.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-60px' }}
              transition={{ duration: 0.7 }}
              className="p-8 sm:p-12 rounded-sm shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#12141a] border border-white/10"
            >
              <div className={`lg:col-span-7 space-y-5 ${!isEven ? 'lg:order-2' : ''}`}>
                <div className="flex items-center space-x-3">
                  <span className="font-mono-editorial text-xs font-bold text-[#C6FF00]">
                    {item.number} // {item.category}
                  </span>
                </div>
                
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-wide">
                  {item.title}
                </h2>
                
                <p className="text-sm leading-relaxed font-light text-[#BFC3C7]">
                  {item.description}
                </p>

                <div className="space-y-3 pt-2">
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs text-zinc-300 font-light">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C6FF00]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-5 ${!isEven ? 'lg:order-1' : ''}`}>
                <TiltCard className="rounded-sm overflow-hidden shadow-2xl group relative border border-white/10">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div 
                    className="absolute inset-0 bg-[#C6FF00]/10 opacity-30 pointer-events-none group-hover:opacity-0 transition-opacity"
                  />
                </TiltCard>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-40px' }}
        transition={{ duration: 0.7 }}
        className="p-12 sm:p-16 rounded-sm text-center space-y-6 shadow-2xl bg-[#12141a] border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />
        <h3 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wide">
          EXPERIENCE A SKYRA RUNWAY SHOW
        </h3>
        <p className="text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed text-[#BFC3C7]">
          Explore upcoming events and register to participate as a contestant in Chennai.
        </p>
        <div className="pt-2 flex justify-center">
          <MagneticButton
            onClick={() => setActiveTab('events')}
            className="px-8 py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg inline-flex items-center space-x-2 bg-[#C6FF00] hover:bg-[#D8FF33] text-black"
          >
            <span>EXPLORE UPCOMING EVENTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </motion.div>
    </div>
  );
}
