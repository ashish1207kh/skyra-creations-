import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  X, 
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TiltCard from '../components/TiltCard';

interface GalleryPageProps {
  setActiveTab: (tab: string) => void;
}

export default function GalleryPage({ setActiveTab }: GalleryPageProps) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; category: string; description: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const galleryItems = [
    {
      id: 1,
      src: '/images/events/skyra-event-03.jpg',
      title: 'Official Skyra Main Stage Walk',
      category: 'RUNWAY',
      description: 'Runway presentation with the signature glowing Skyra Creations LED backdrop and couture ensembles.',
      span: 'md:col-span-8 md:row-span-2'
    },
    {
      id: 2,
      src: '/images/events/skyra-event-07.jpg',
      title: 'Grand Universe World Record Award',
      category: 'STAGE',
      description: 'Official World Record certificate presentation to Founder & Director B. Sriram on the grand stage.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 3,
      src: '/images/events/skyra-event-02.jpg',
      title: 'Bridal Fashion Fest 15:00 // Chennai City Centre',
      category: 'RUNWAY',
      description: 'Grand fashion pageant stage with Golden Crown Awards celebrating top contestants and winners.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 4,
      src: '/images/events/skyra-event-01.jpg',
      title: 'Haute Couture Grand Finale',
      category: 'RUNWAY',
      description: 'Runway models assembled for the walk under stage lighting for the collection finale.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 5,
      src: '/images/events/skyra-event-14.jpg',
      title: 'Stage Show India // Golden Elegance Awards',
      category: 'STAGE',
      description: 'Gala award ceremony with contestants and models holding official gold trophies and certificates.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 6,
      src: '/images/events/skyra-event-08.jpg',
      title: 'Skyra Model Academy Graduates',
      category: 'MENTORSHIP',
      description: 'Graduating troop of aspiring models displaying their verified portfolio certificates and awards.',
      span: 'md:col-span-12 md:row-span-1'
    },
    {
      id: 7,
      src: '/images/events/skyra-event-12.jpg',
      title: 'Lion Awards 2.0 // Silk & Traditional Couture',
      category: 'STAGE',
      description: 'Ethnic and contemporary silk showcase with models honored with Lion Awards mementos.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 8,
      src: '/images/events/skyra-event-04.jpg',
      title: 'Official Ramp Walk Certifications',
      category: 'MENTORSHIP',
      description: 'Director B. Sriram and coaching faculty presenting authenticated participation certificates.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 9,
      src: '/images/events/skyra-event-11.jpg',
      title: 'Remo International College Ramp Showcase',
      category: 'MENTORSHIP',
      description: 'Inclusive mentorship featuring Kids, Teens, and Adults walking the ramp together.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 10,
      src: '/images/events/skyra-event-05.jpg',
      title: 'Skyra Creations Production Arena',
      category: 'STAGE',
      description: 'Intelligent stage lighting, curved LED trusses, and illuminated walk ramp arena.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 11,
      src: '/images/events/skyra-event-13.jpg',
      title: 'Trophy Celebration & Victory Moment',
      category: 'STAGE',
      description: 'Candid celebratory moment with models cheering and capturing memories with awards.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 12,
      src: '/images/events/skyra-event-06.jpg',
      title: 'Walk Stage Horizon',
      category: 'RUNWAY',
      description: 'Panoramic view of the fashion contest runway and media seating at Chennai City Centre.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 13,
      src: '/images/events/skyra-event-10.jpg',
      title: 'Lighting & Stage Precision',
      category: 'RUNWAY',
      description: 'Curated audio-visual and stage coordination behind every Skyra Creations show.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 14,
      src: '/images/events/skyra-event-09.jpg',
      title: 'Runway Arena Showcase',
      category: 'STAGE',
      description: 'Live walk production bringing together designers, models, and industry leaders.',
      span: 'md:col-span-12 md:row-span-1'
    }
  ];

  const filteredItems = activeFilter === 'ALL' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pt-6 sm:pb-16 space-y-8 sm:space-y-12">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest" style={{ color: 'var(--accent)' }}>
          VISUAL ARCHIVE
        </span>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] break-words" style={{ color: 'var(--text-primary)' }}>
          SKYRA MOMENTS.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Moments of fashion, poise and runway elegance from official SKYRA CREATIONS runway shows and model showcases.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {['ALL', 'RUNWAY', 'STAGE', 'MENTORSHIP'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-4 py-2 font-mono-editorial text-[10px] tracking-widest uppercase transition-all rounded-sm"
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'var(--surface)',
                  color: isActive ? '#000000' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  fontWeight: isActive ? 700 : 400
                }}
              >
                {filter === 'ALL' ? 'ALL ARCHIVES' : filter}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Asymmetric Gallery Grid with React Spring 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
        {filteredItems.map((item, idx) => (
          <TiltCard
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className={`group relative overflow-hidden rounded-sm cursor-pointer shadow-lg ${item.span}`}
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-20px' }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
              className="w-full h-full relative"
            >
              <img 
                src={item.src} 
                alt={item.title}
                loading="lazy"
                className={`w-full h-full object-cover ${item.src.includes('founder') ? 'object-top' : 'object-center'} group-hover:scale-105 transition-transform duration-700`} 
              />

              {/* Editorial Caption Bar */}
              <div 
                className="absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
              >
                <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--accent)' }}>
                  {item.category}
                </span>
                <h3 className="font-editorial text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-1 font-light">
                  {item.description}
                </p>
              </div>

              {/* Hover Zoom Icon */}
              <div 
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid var(--border)' }}
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </TiltCard>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] p-4 overflow-hidden rounded-sm"
              style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)' 
              }}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full transition-colors z-10"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto mx-auto object-contain rounded-sm"
              />

              <div className="mt-4 px-2 text-center space-y-1">
                <span className="font-mono-editorial text-[10px]" style={{ color: 'var(--accent)' }}>
                  {selectedImage.category}
                </span>
                <h4 className="font-editorial text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedImage.title}
                </h4>
                <p className="text-xs max-w-lg mx-auto font-light" style={{ color: 'var(--text-muted)' }}>
                  {selectedImage.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-20px' }}
        transition={{ duration: 0.7 }}
        className="p-10 sm:p-14 text-center space-y-5 rounded-sm shadow-xl"
        style={{ 
          backgroundColor: 'var(--surface)', 
          border: '1px solid var(--border)' 
        }}
      >
        <h3 className="font-editorial text-2xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Walk the Runway in Our Next Showcase
        </h3>
        <p className="text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Registrations are now open for Runway Show 2026. Join our verified runway lineup in Chennai.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setActiveTab('register')}
            className="px-8 py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000'
            }}
          >
            <span>REGISTER NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
