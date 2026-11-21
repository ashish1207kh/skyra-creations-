import React, { useState } from 'react';
import { 
  Camera, 
  ZoomIn, 
  X, 
  Sparkles, 
  Layers, 
  Award,
  ArrowRight
} from 'lucide-react';

interface GalleryPageProps {
  setActiveTab: (tab: string) => void;
}

export default function GalleryPage({ setActiveTab }: GalleryPageProps) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; category: string; description: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const galleryItems = [
    {
      id: 1,
      src: '/images/runway-1.jpg',
      title: 'Runway Couture Walk',
      category: 'RUNWAY',
      description: 'Solo catwalk presentation in high-fashion designer collection under stage spotlights.',
    },
    {
      id: 2,
      src: '/images/runway-2.jpg',
      title: 'Confidence & Catwalk Poise',
      category: 'RUNWAY',
      description: 'Model presenting vibrant apparel on the runway stage during official showcase.',
    },
    {
      id: 3,
      src: '/images/runway-3.jpg',
      title: 'Stage Grand Finale',
      category: 'STAGE',
      description: 'Showcase conclusion featuring participating contestants and creative stylists.',
    },
    {
      id: 4,
      src: '/founder.png',
      title: 'Leadership & Model Mentorship',
      category: 'MENTORSHIP',
      description: 'Founder & CEO B Sriram guiding contestants on stage etiquette and presentation.',
    },
    {
      id: 5,
      src: '/og-image.png',
      title: 'Official Runway Showcase Banner',
      category: 'STAGE',
      description: 'SKYRA CREATIONS official event identity and runway visual showcase production.',
    },
    {
      id: 6,
      src: '/images/runway-2.jpg',
      title: 'Editorial Catwalk Pacing',
      category: 'RUNWAY',
      description: 'Showcasing elegance, rhythm, and garment drape on the Chennai ramp.',
    },
  ];

  const filteredItems = activeFilter === 'ALL' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest inline-block">
          Visual Highlights
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
          SKYRA CREATIONS Gallery
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
          Moments of fashion, poise and catwalk elegance from official SKYRA CREATIONS runway shows and model showcases.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['ALL', 'RUNWAY', 'STAGE', 'MENTORSHIP'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {filter === 'ALL' ? 'All Photographs' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative rounded-3xl overflow-hidden bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-md cursor-pointer hover:border-amber-500/50 hover:shadow-2xl transition-all"
          >
            <div className="aspect-[4/3] overflow-hidden bg-black">
              <img 
                src={item.src} 
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>

            <div className="p-5 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                {item.category}
              </span>
              <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Hover Icon Overlay */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-3xl p-4 overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 transition-colors"
              title="Close Image"
            >
              <X className="w-5 h-5" />
            </button>

            <img 
              src={selectedImage.src} 
              alt={selectedImage.title}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />

            <div className="mt-3 px-2 text-center text-white">
              <h4 className="font-editorial text-xl font-bold text-amber-400">{selectedImage.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#d4ff14]/10 to-amber-500/10 border border-amber-500/30 text-center space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Walk the Runway in Our Next Showcase
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
          Registrations are now open for Runway Show 2026. Join our verified runway lineup in Chennai.
        </p>
        <button
          onClick={() => setActiveTab('register')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
        >
          <span>Register Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
