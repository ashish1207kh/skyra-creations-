import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  X, 
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      src: '/images/runway-1.jpg',
      title: 'Runway Couture Walk',
      category: 'RUNWAY',
      description: 'Solo catwalk presentation in high-fashion designer collection under stage spotlights.',
      span: 'md:col-span-8 md:row-span-2'
    },
    {
      id: 2,
      src: '/images/runway-2.jpg',
      title: 'Confidence & Catwalk Poise',
      category: 'RUNWAY',
      description: 'Model presenting vibrant apparel on the runway stage during official showcase.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 3,
      src: '/founder.png',
      title: 'Leadership & Model Mentorship',
      category: 'MENTORSHIP',
      description: 'Founder & CEO B Sriram guiding contestants on stage etiquette and presentation.',
      span: 'md:col-span-4 md:row-span-1'
    },
    {
      id: 4,
      src: '/images/runway-3.jpg',
      title: 'Stage Grand Finale',
      category: 'STAGE',
      description: 'Showcase conclusion featuring participating contestants and creative stylists.',
      span: 'md:col-span-6 md:row-span-1'
    },
    {
      id: 5,
      src: '/og-image.png',
      title: 'Official Runway Showcase Banner',
      category: 'STAGE',
      description: 'SKYRA CREATIONS official event identity and runway visual showcase production.',
      span: 'md:col-span-6 md:row-span-1'
    },
  ];

  const filteredItems = activeFilter === 'ALL' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
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
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
          CATWALK MOMENTS.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Moments of fashion, poise and catwalk elegance from official SKYRA CREATIONS runway shows and model showcases.
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

      {/* Asymmetric Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            onClick={() => setSelectedImage(item)}
            className={`group relative overflow-hidden rounded-sm cursor-pointer shadow-lg transition-all ${item.span}`}
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <img 
              src={item.src} 
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
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
        viewport={{ once: true }}
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
