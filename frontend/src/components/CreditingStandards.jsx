import React, { useRef } from 'react';

// Import local logos added by user
import verraLogo from '../assets/verra logo.png';
import icVcmLogo from '../assets/Ic VCM logo.png';
import goldStandardLogo from '../assets/Gold standard logo.png';
import beeLogo from '../assets/bee-logo (1).png';

const cdStyle = {
  color: '#08292F',
  headingFont: 'var(--font-body)',
  bodyFont: 'var(--font-body)',
};

const CreditingStandards = ({ title = "Aligned with leading global crediting standards", children }) => {
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      // Safely slows down the CSS animation playback without causing jumps
      const animations = containerRef.current.getAnimations({ subtree: true });
      animations.forEach(anim => { anim.playbackRate = 0.2; });
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      // Restores normal scrolling speed
      const animations = containerRef.current.getAnimations({ subtree: true });
      animations.forEach(anim => { anim.playbackRate = 1.0; });
    }
  };

  const standards = [
    { 
      name: "Verra", 
      subtext: "Verified Carbon Standard", 
      logoUrl: verraLogo,
      isText: false
    },
    { 
      name: "IC-VCM", 
      subtext: "Integrity Council", 
      logoUrl: icVcmLogo, 
      isText: false 
    },
    { 
      name: "ABACUS", 
      subtext: "High-Integrity Label", 
      logoUrl: null, 
      isText: true 
    },
    { 
      name: "BEE", 
      subtext: "Indian Carbon Market", 
      logoUrl: beeLogo, 
      isText: false 
    },
    { 
      name: "Gold Standard", 
      subtext: "Certified Credits", 
      logoUrl: goldStandardLogo,
      isText: false
    },
  ];

  const duplicated = [...standards, ...standards, ...standards, ...standards];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <strong 
            className="block text-base font-bold mb-2"
            style={{ fontFamily: cdStyle.headingFont, color: '#01311D' }}
          >
            {title}
          </strong>
        </div>

        <div 
          className="relative w-full overflow-hidden bg-transparent py-6 cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={containerRef}
        >
          <div className="flex animate-marquee">
            {duplicated.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center mx-12 min-w-[180px] opacity-60 hover:opacity-100 transition-opacity duration-300 group"
              >
                {item.logoUrl && (
                  <img 
                    src={item.logoUrl} 
                    alt={`${item.name} Logo`} 
                    className="h-16 w-auto object-contain mb-3 filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                    onError={(e) => {
                      // Fallback logic incase image path is incorrect
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'block';
                      }
                    }}
                  />
                )}
                
                <span
                  className={`${item.name === 'ABACUS' ? 'text-2xl font-bold tracking-[0.2em] uppercase' : 'text-xl font-medium'} mb-1 transition-colors duration-300`}
                  style={{ 
                    fontFamily: cdStyle.headingFont, 
                    color: item.logoUrl && !item.isText ? 'transparent' : cdStyle.color,
                    display: item.logoUrl && !item.isText ? 'none' : 'block'
                  }}
                >
                  {item.name}
                </span>
                <span
                  className={`${item.name === 'ABACUS' ? 'text-xs font-semibold uppercase tracking-wider' : 'text-sm font-normal'} text-center`}
                  style={{ fontFamily: cdStyle.bodyFont, color: 'rgba(8, 41, 47, 0.64)' }}
                >
                  {item.subtext}
                </span>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
              width: max-content;
              display: flex;
            }
          `}</style>
        </div>

        {children}
      </div>
    </section>
  );
};

export default CreditingStandards;
