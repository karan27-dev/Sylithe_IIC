import React, { useEffect, useRef } from 'react';

/**
 * Pyrolysis process film for the Biochar "How it works" section.
 *
 * Self-hosted from /public/video — no third-party player, no tracking, no
 * domain whitelist to trip over. The footage is a light-background isometric
 * explainer that carries its own step labels, so it is presented on a light
 * surface with no colour grading over the top; anything darker would fight it.
 *
 * The video is always visible: there is deliberately no "reveal once loaded"
 * opacity gate. An earlier version faded it in on `loadeddata`, which never
 * fires reliably under preload="metadata" — the result was a permanently blank
 * white block. The clip is ~1 MB and its own background is white, so it can sit
 * directly on the white container with nothing to hide.
 *
 * To swap the footage, drop a replacement at the same path (or change SRC) and
 * update NATIVE_W / NATIVE_H to its pixel dimensions.
 */
const SRC = '/video/biochar-process.mp4';
const NATIVE_W = 1972;
const NATIVE_H = 1048;

/**
 * @param {boolean} fullBleed — run edge to edge across the tab (no rounded
 *   corners or border), for the standalone "How It Works" band.
 */
const BiocharProcessVideo = ({ className = '', fullBleed = false }) => {
  const videoRef = useRef(null);

  // Some browsers ignore the autoplay attribute when the element mounts inside
  // an animating subtree. Muted + playsInline autoplay is always permitted, so
  // ask again once we're mounted and swallow the promise rejection if the user
  // has media autoplay disabled entirely.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const attempt = () => { const p = el.play(); if (p) p.catch(() => {}); };
    attempt();
    el.addEventListener('canplay', attempt, { once: true });
    return () => el.removeEventListener('canplay', attempt);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden bg-white ${fullBleed ? '' : 'rounded-3xl border border-slate-200'} ${className}`}
      style={{ aspectRatio: `${NATIVE_W} / ${NATIVE_H}` }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Animated explainer: woody biomass and agricultural residues are heated in a pyrolysis plant without oxygen, generating renewable energy as a byproduct and locking carbon into a stable form called biochar, which is then added to soil or to durable building materials."
        // contain, not cover: the footage is an infographic with labels near the
        // edges, and cropping would cut them off on unusual container ratios.
        className="absolute inset-0 h-full w-full object-contain"
      >
        <source src={SRC} type="video/mp4" />
      </video>
    </div>
  );
};

export default BiocharProcessVideo;
