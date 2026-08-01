import React, { useState, useRef, useCallback, useEffect } from 'react';

const BASE = process.env.PUBLIC_URL || '';

const HERO_SLIDES = [
  { src: `${BASE}/hero-pic-main.png`, alt: 'Smart Grow Chain' },
  { src: `${BASE}/hero-pic1.jpg`,     alt: 'Smart Grow Chain 1' },
  { src: `${BASE}/hero-pic-2.jpg`,    alt: 'Smart Grow Chain 2' },
  { src: `${BASE}/hero-pic-3.jpg`,    alt: 'Smart Grow Chain 3' },
];

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const trackRef = useRef(null);
  const slideCount = HERO_SLIDES.length;
  const loopSlides = [...HERO_SLIDES, ...HERO_SLIDES, ...HERO_SLIDES];

  const centerSlide = useCallback((physicalIndex, behavior = 'smooth') => {
    const track = trackRef.current;
    const slide = track?.children[physicalIndex];
    if (!track || !slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior,
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => centerSlide(slideCount, 'auto'));
    return () => cancelAnimationFrame(frame);
  }, [centerSlide, slideCount]);

  useEffect(() => {
    if (isInteracting) return undefined;
    const autoplay = setInterval(() => {
      setActiveSlide(currentSlide => {
        const nextSlide = (currentSlide + 1) % slideCount;
        centerSlide(slideCount + nextSlide);
        return nextSlide;
      });
    }, 3500);
    return () => clearInterval(autoplay);
  }, [centerSlide, isInteracting, slideCount]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(track.children).forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveSlide(closestIndex % slideCount);
    if (closestIndex <= slideCount - 1) {
      requestAnimationFrame(() => centerSlide(closestIndex + slideCount, 'auto'));
    } else if (closestIndex >= slideCount * 2) {
      requestAnimationFrame(() => centerSlide(closestIndex - slideCount, 'auto'));
    }
  };

  const goTo = (i) => {
    centerSlide(slideCount + i);
    setActiveSlide(i);
  };

  return (
    <div className="sgc-hero-slider">
      <div className="sgc-hero-slider-track" ref={trackRef} onScroll={handleScroll}
        onPointerDown={()=>setIsInteracting(true)} onPointerUp={()=>setIsInteracting(false)}
        onPointerCancel={()=>setIsInteracting(false)}
        onPointerLeave={e=>{ if(e.pointerType==='mouse') setIsInteracting(false); }}>
        {loopSlides.map((s,i)=>(
          <div key={`${s.src}-${i}`} className={`sgc-hero-slide${activeSlide===i%slideCount?' active-slide':''}`}>
            <img src={s.src} alt={s.alt} onError={e=>{ e.target.style.display='none'; }}/>
          </div>
        ))}
      </div>
      <div className="sgc-hero-dots">
        {HERO_SLIDES.map((_,i)=>(
          <button key={i} className={`sgc-hero-dot${activeSlide===i?' active':''}`} onClick={()=>goTo(i)}/>
        ))}
      </div>
    </div>
  );
}