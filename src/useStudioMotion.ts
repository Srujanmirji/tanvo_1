import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// The installed Motion hook reads this preference only once; keep live changes accessible.
export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    update();
    return () => preference.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Scroll owns outer layers; pointer and idle motion own nested layers. */
export function useStudioMotion(reduced: boolean | null) {
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.05, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const media = gsap.matchMedia();
    let alive = true;
    const context = gsap.context(() => {
      gsap.from('.hero h1 .line span', {
        yPercent: 108, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.from(el, {
          y: 24, opacity: 0, duration: 0.7,
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach(el => {
        const value = { number: 0 };
        gsap.to(value, {
          number: Number(el.dataset.count), roundProps: 'number', duration: 1.5,
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
          onUpdate: () => { el.textContent = String(value.number); },
        });
      });
      // Refresh pinned distances when an expandable service changes page height.
      const resize = new ResizeObserver(() => ScrollTrigger.refresh());
      resize.observe(document.querySelector('.services')!);

      gsap.utils.toArray<HTMLElement>('.insight-row').forEach(el => {
        ScrollTrigger.create({
          trigger: el, start: 'top 65%', end: 'bottom 40%',
          toggleClass: { targets: el, className: 'is-active' },
        });
      });
      gsap.fromTo('.why', { '--paper-reveal': 1 }, {
        '--paper-reveal': 0,
        scrollTrigger: { trigger: '.why', start: 'top 95%', end: 'top 35%', scrub: true },
      });
      media.add({ all: '(min-width: 0px)', desktop: '(min-width: 1000px) and (min-height: 650px)', mobile: '(max-width: 767px)', fine: '(pointer: fine) and (min-width: 1000px)' }, match => {
        const { desktop, mobile, fine } = match.conditions!;
        const stageNodes = gsap.utils.toArray<HTMLElement>('.stage');
        const line = document.querySelector('.timeline-fill');
        const updateProcess = (progress: number) => {
          const current = Math.min(3, Math.floor(progress * 4));
          stageNodes.forEach((node, i) => {
            node.classList.toggle('is-complete', i < current);
            node.classList.toggle('is-active', i === current);
          });
          gsap.set(line, mobile ? { scaleY: progress, scaleX: 1 } : { scaleX: progress, scaleY: 1 });
        };
        ScrollTrigger.create({
          trigger: '.process', start: 'top 65%', end: 'bottom 40%',
          onUpdate: self => updateProcess(self.progress),
          onRefresh: self => updateProcess(self.progress),
        });

        const frames = gsap.utils.toArray<HTMLElement>('.story-statement');
        gsap.set(frames, { opacity: 0, scale: 0.93, clipPath: 'inset(15% 0 15% 0)', filter: 'blur(0px)' });
        gsap.set(frames[0], { opacity: 1, scale: 1, clipPath: 'inset(0% 0 0% 0)' });
        const story = gsap.timeline({
          scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        });
        frames.forEach((frame, i) => {
          if (i > 0) story.to(frame, { opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0 0% 0)', duration: 0.8 }, i * 1.6);
          if (i < frames.length - 1) story.to(frame, { opacity: 0, scale: mobile ? 1 : 1.04, filter: mobile ? 'blur(0px)' : 'blur(5px)', clipPath: 'inset(45% 0 45% 0)', duration: 0.6 }, i * 1.6 + 1);
        });
        story.to('.story-rule-fill', { scaleX: 1, ease: 'none', duration: story.duration() }, 0);
        story.to({}, { duration: 0.8 });

        const track = document.querySelector<HTMLElement>('.portfolio-track')!;
        if (desktop) {
          const travel = () => Math.max(0, track.scrollWidth - track.clientWidth);
          const slide = gsap.to(track, {
            x: () => -travel(), ease: 'none',
            scrollTrigger: {
              id: 'portfolio', refreshPriority: 1, trigger: '.work', start: 'top 82px', end: () => `+=${travel()}`,
              pin: true, scrub: 0.7, invalidateOnRefresh: true,
              onUpdate: self => gsap.set('.work-progress-fill', { scaleX: self.progress }),
            },
          });
          gsap.utils.toArray<HTMLElement>('.project-image').forEach((el, i) => {
            if (i === 0) return;
            gsap.fromTo(el, { clipPath: 'inset(0% 12% 0% 0%)' }, {
              clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
              scrollTrigger: { trigger: el, containerAnimation: slide, start: 'left 95%', end: 'left 35%', scrub: true },
            });
          });
          gsap.to('.hero-art .sculpture', { y: -130, rotation: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
          gsap.to('.hero h1', { y: -65, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
          gsap.to('.hero-copy > p', { opacity: 0, y: -15, scrollTrigger: { trigger: '.hero', start: 'top top', end: '35% top', scrub: true } });
          gsap.to('.about-image', { yPercent: 17, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
          gsap.to('.contact-device', { y: -50, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        }

        if (!fine) return;
        const removals: (() => void)[] = [];
        const attachTilt = (region: string, target: string, degrees: number) => {
          const area = document.querySelector<HTMLElement>(region)!;
          const element = area.querySelector<HTMLElement>(target)!;
          const tiltX = gsap.quickTo(element, 'rotationX', { duration: 0.8, ease: 'power3.out' });
          const tiltY = gsap.quickTo(element, 'rotationY', { duration: 0.8, ease: 'power3.out' });
          const move = (event: PointerEvent) => {
            const box = area.getBoundingClientRect();
            tiltX((0.5 - (event.clientY - box.top) / box.height) * degrees);
            tiltY(((event.clientX - box.left) / box.width - 0.5) * degrees);
          };
          const reset = () => { tiltX(0); tiltY(0); };
          area.addEventListener('pointermove', move);
          area.addEventListener('pointerleave', reset);
          removals.push(() => { area.removeEventListener('pointermove', move); area.removeEventListener('pointerleave', reset); });
        };
        attachTilt('.hero', '.sculpture-rotor', 12);
        attachTilt('.contact', '.phone-mock', 14);
        const idle = gsap.to('.hero .structure', { rotationZ: '+=5', duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
        const light = gsap.to('.orbit', { x: 50, y: -40, opacity: 0.5, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
        let heroVisible = false;
        let contactVisible = false;
        const sync = () => { idle.paused(!heroVisible || document.hidden); light.paused(!contactVisible || document.hidden); };
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => { if (entry.target.id === 'home') heroVisible = entry.isIntersecting; else contactVisible = entry.isIntersecting; });
          sync();
        });
        observer.observe(document.querySelector('.hero')!);
        observer.observe(document.querySelector('.contact')!);
        document.addEventListener('visibilitychange', sync);

        const cursor = document.querySelector<HTMLElement>('.custom-cursor')!;
        const moveX = gsap.quickTo(cursor, 'x', { duration: 0.15 });
        const moveY = gsap.quickTo(cursor, 'y', { duration: 0.15 });
        const moveCursor = (event: PointerEvent) => {
          moveX(event.clientX); moveY(event.clientY);
          cursor.classList.toggle('visible', event.target instanceof Element && !!event.target.closest('.project-image'));
        };
        const hideCursor = () => cursor.classList.remove('visible');
        document.addEventListener('pointermove', moveCursor);
        window.addEventListener('scroll', hideCursor, { passive: true });
        window.addEventListener('blur', hideCursor);
        return () => {
          removals.forEach(remove => remove());
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          document.removeEventListener('pointermove', moveCursor);
          window.removeEventListener('scroll', hideCursor);
          window.removeEventListener('blur', hideCursor);
          hideCursor();
        };
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => resize.disconnect();
    });
    return () => {
      alive = false;
      media.revert();
      context.revert();
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, [reduced]);
}
