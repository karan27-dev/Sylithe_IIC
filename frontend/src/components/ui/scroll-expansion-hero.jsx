import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform } from 'framer-motion';



const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children
}) => {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  // Preload the video as soon as component mounts
  useEffect(() => {
    if (mediaType === 'video' && mediaSrc && !mediaSrc.includes('youtube.com')) {
      // Inject a preload link into <head> for early fetching
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = mediaSrc;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [mediaSrc, mediaType]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobileState, setIsMobileState] = useState(false);

  const sectionRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Increase sensitivity for mobile, especially when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Higher sensitivity for scrolling back
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = () => {
      setTouchStartY(0);
    };

    const handleScroll = () => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, {
      passive: false
    });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener(
      'touchstart',
      handleTouchStart,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  // Split by comma if present for better line control, else fallback to first word split
  let line1 = '';
  let line2 = '';
  
  if (title) {
    if (title.includes(',')) {
      const parts = title.split(',');
      line1 = parts[0] + ',';
      line2 = parts.slice(1).join(',').trim();
    } else {
      line1 = title.split(' ')[0];
      line2 = title.split(' ').slice(1).join(' ');
    }
  }

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden bg-[#081C15]'>

      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}>

            <img
              src={bgImageSrc}
              alt='Background'
              className='w-screen h-screen object-cover object-center mix-blend-luminosity opacity-40' />

            <div className='absolute inset-0 bg-[#081C15]/60' />
          </motion.div>

          <div className='w-full flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              <div
                className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.5)'
                }}>

                {mediaType === 'video' ?
                  mediaSrc.includes('youtube.com') ?
                    <div className='relative w-full h-full pointer-events-none'>
                      <iframe
                        width='100%'
                        height='100%'
                        src={
                          mediaSrc.includes('embed') ?
                            mediaSrc + (
                              mediaSrc.includes('?') ? '&' : '?') +
                            'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1' :
                            mediaSrc.replace('watch?v=', 'embed/') +
                            '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                            mediaSrc.split('v=')[1]
                        }
                        className='w-full h-full rounded-xl'
                        frameBorder={0}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen />

                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}>
                      </div>

                      <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }} />

                    </div> :

                    <div className='relative w-full h-full pointer-events-none'>
                      {/* Poster shown immediately as background while video loads */}
                      {posterSrc && (
                        <img
                          src={posterSrc}
                          alt={title || 'Loading...'}
                          className='absolute inset-0 w-full h-full object-cover rounded-xl'
                          style={{ opacity: videoReady ? 0 : 1, transition: 'opacity 0.6s ease-in-out' }}
                        />
                      )}
                      <video
                        ref={videoRef}
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload='auto'
                        className='w-full h-full object-cover rounded-xl'
                        style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                        onCanPlayThrough={() => setVideoReady(true)}
                        onPlaying={() => setVideoReady(true)}
                      />

                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}>
                      </div>

                      <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }} />

                    </div> :


                  <div className='relative w-full h-full'>
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className='w-full h-full object-cover rounded-xl' />


                    <motion.div
                      className='absolute inset-0 bg-[#081C15]/40 rounded-xl'
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }} />

                  </div>
                }

                <div className='flex flex-col items-center text-center relative z-10 mt-4 transition-none'>
                   {date &&
                    <p
                      className='text-xl text-[#A3E635] font-normal uppercase tracking-widest'
                      style={{ 
                        transform: `translateX(-${textTranslateX}vw)`,
                        fontFamily: 'var(--font-body)'
                      }}>
                      {date}
                    </p>
                  }
                   {scrollToExpand &&
                    <p
                      className='text-white/70 font-normal text-center mt-2 animate-bounce'
                      style={{ 
                        transform: `translateX(${textTranslateX}vw)`,
                        fontFamily: 'var(--font-body)'
                      }}>
                      {scrollToExpand}
                    </p>
                  }
                </div>
              </div>

              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${textBlend ? 'mix-blend-difference' : 'mix-blend-normal'}`
                }>

                 <motion.h2
                  className='text-5xl md:text-7xl lg:text-8xl font-normal text-white transition-none leading-[1.15] tracking-tight'
                  style={{ 
                    transform: `translateX(-${textTranslateX}vw)`,
                    fontFamily: 'var(--font-body)'
                  }}>
                  {line1}
                </motion.h2>
                <motion.h2
                  className='text-5xl md:text-7xl lg:text-8xl font-normal text-center text-white transition-none leading-[1.15] tracking-tight'
                  style={{ 
                    transform: `translateX(${textTranslateX}vw)`,
                    fontFamily: 'var(--font-body)'
                  }}>
                  {line2}
                </motion.h2>
              </div>
            </div>

            <motion.section
              className='flex flex-col w-full'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}>

              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>);

};

export default ScrollExpandMedia;