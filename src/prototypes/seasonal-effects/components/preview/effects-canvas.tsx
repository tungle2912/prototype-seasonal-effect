import { useEffect, useRef } from 'react';

import {
  artworkGlyph,
  densityParticles,
  type Density,
  type FallingArtwork,
  type ParticleColour,
  type TrailLength,
} from '../../../../mocks/seasonal-effects/effects';

/**
 * One canvas for every effect: falling particles, confetti and the cursor trail.
 *
 * The drawing rules here are the product, not an implementation detail. The spec
 * puts a hard performance budget on the storefront runtime, and these are the parts
 * of it that a prototype can honestly demonstrate:
 *
 * - **One canvas, one rAF loop.** A DOM node per particle is what makes competing
 *   apps stutter; a hundred absolutely-positioned divs is a hundred layout boxes.
 * - **An object pool.** Particles that fall off the bottom are reused, so the loop
 *   allocates nothing and never triggers a GC pause mid-scroll.
 * - **`pointer-events: none`.** The overlay can never eat a click. "The effect
 *   blocked my Add to cart button" is this category's classic one-star review.
 * - **Stops when there is nothing to draw.** No effects on, or the tab hidden, and
 *   the loop is cancelled rather than left spinning on an empty frame.
 *
 * React adds one more requirement the plain-JS original did not have: the loop must
 * be cancelled on unmount, or switching screens leaks a rAF per visit.
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  spin: number;
  angle: number;
  alpha: number;
}

interface Confetto {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  hue: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
  size: number;
}

const TRAIL_LIMIT: Record<TrailLength, number> = { SHORT: 10, MEDIUM: 22, LONG: 40 };

/** A hard ceiling, not a setting: past this the frame budget goes. */
const CURSOR_PARTICLE_CAP = 120;

interface EffectsCanvasProps {
  artwork: FallingArtwork;
  density: Density;
  colour: ParticleColour;
  /** Used when colour is BRAND, so particles pick up the merchant's palette. */
  brandHex: string;
  fallingEnabled: boolean;
  cursorEnabled: boolean;
  cursorLength: TrailLength;
  /** Increment to fire a confetti burst; the value itself is ignored. */
  burstAt?: { x: number; y: number; seq: number } | null;
}

export function EffectsCanvas({
  artwork,
  density,
  colour,
  brandHex,
  fallingEnabled,
  cursorEnabled,
  cursorLength,
  burstAt,
}: EffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const confetti = useRef<Confetto[]>([]);
  const trail = useRef<TrailPoint[]>([]);
  const lastBurst = useRef(-1);
  /** Set by the loop effect; called to restart after the idle exit. */
  const restart = useRef<() => void>(() => {});

  // Live settings, read inside the loop so changing a control does not restart it.
  const settings = useRef({ artwork, density, colour, brandHex, fallingEnabled, cursorEnabled, cursorLength });
  settings.current = { artwork, density, colour, brandHex, fallingEnabled, cursorEnabled, cursorLength };

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const maybeContext = canvas.getContext('2d');
    if (!maybeContext) return;
    // A const, so the null check still holds inside the hoisted loop function.
    const context: CanvasRenderingContext2D = maybeContext;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;

    const fit = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width === width && rect.height === height) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
    };

    /** Reused, never recreated: this is the object pool. */
    const reset = (particle: Particle, fromTop: boolean) => {
      particle.x = Math.random() * width;
      particle.y = fromTop ? -20 : Math.random() * height;
      particle.size = 8 + Math.random() * 12;
      particle.speed = 0.3 + Math.random() * 0.9;
      particle.drift = (Math.random() - 0.5) * 0.5;
      particle.spin = (Math.random() - 0.5) * 0.03;
      particle.angle = Math.random() * Math.PI * 2;
      particle.alpha = 0.55 + Math.random() * 0.45;
    };

    const resize = (target: number) => {
      const pool = particles.current;
      while (pool.length < target) {
        const particle: Particle = {
          x: 0,
          y: 0,
          size: 10,
          speed: 1,
          drift: 0,
          spin: 0,
          angle: 0,
          alpha: 1,
        };
        reset(particle, false);
        pool.push(particle);
      }
      if (pool.length > target) pool.length = target;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!settings.current.cursorEnabled) return;
      const rect = parent.getBoundingClientRect();
      trail.current.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        life: 1,
        size: 6 + Math.random() * 6,
      });
      const limit = Math.min(TRAIL_LIMIT[settings.current.cursorLength], CURSOR_PARTICLE_CAP);
      if (trail.current.length > limit) trail.current.splice(0, trail.current.length - limit);
    };

    const onVisibility = () => {
      // Hidden tab: stop completely rather than burn frames nobody sees.
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };

    function loop() {
      if (!running) return;
      fit();
      context.clearRect(0, 0, width, height);

      const current = settings.current;

      if (current.fallingEnabled) {
        resize(densityParticles(current.density));
        const glyph = artworkGlyph(current.artwork);
        const useBrand = current.colour === 'BRAND';

        for (const particle of particles.current) {
          particle.y += particle.speed;
          particle.x += particle.drift;
          particle.angle += particle.spin;
          if (particle.y > height + 20) reset(particle, true);
          if (particle.x < -20) particle.x = width + 20;
          if (particle.x > width + 20) particle.x = -20;

          context.save();
          context.globalAlpha = particle.alpha;
          context.translate(particle.x, particle.y);
          context.rotate(particle.angle);
          if (useBrand) {
            context.fillStyle = current.brandHex;
            context.beginPath();
            context.arc(0, 0, particle.size / 3, 0, Math.PI * 2);
            context.fill();
          } else {
            context.font = `${particle.size}px serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(glyph, 0, 0);
          }
          context.restore();
        }
      } else if (particles.current.length > 0) {
        particles.current.length = 0;
      }

      if (current.cursorEnabled) {
        for (const point of trail.current) {
          point.life -= 0.045;
        }
        trail.current = trail.current.filter((point) => point.life > 0);

        for (const point of trail.current) {
          context.save();
          context.globalAlpha = Math.max(0, point.life) * 0.8;
          context.fillStyle = current.brandHex;
          context.beginPath();
          context.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      } else if (trail.current.length > 0) {
        trail.current = [];
      }

      if (confetti.current.length > 0) {
        for (const piece of confetti.current) {
          piece.vy += 0.12;
          piece.x += piece.vx;
          piece.y += piece.vy;
          piece.life -= 0.012;
        }
        confetti.current = confetti.current.filter((piece) => piece.life > 0 && piece.y < height + 40);

        for (const piece of confetti.current) {
          context.save();
          context.globalAlpha = Math.max(0, piece.life);
          context.fillStyle = `hsl(${piece.hue} 85% 58%)`;
          context.translate(piece.x, piece.y);
          context.rotate(piece.life * 6);
          context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
          context.restore();
        }
      }

      const idle =
        !current.fallingEnabled &&
        !current.cursorEnabled &&
        confetti.current.length === 0 &&
        trail.current.length === 0;

      // Nothing to draw: drop out of the loop instead of running it empty. It
      // restarts as soon as a setting turns something back on.
      if (idle) {
        running = false;
        return;
      }

      frame = requestAnimationFrame(loop);
    }

    fit();
    parent.addEventListener('pointermove', onPointerMove);
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(loop);

    // Restarting is pushed from the outside rather than polled for: a timer that
    // wakes four times a second forever would undo the point of the idle exit.
    restart.current = () => {
      if (running || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    return () => {
      restart.current = () => {};
      running = false;
      cancelAnimationFrame(frame);
      parent.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Anything that gives the loop something to draw wakes it back up.
  useEffect(() => {
    if (fallingEnabled || cursorEnabled) restart.current();
  }, [fallingEnabled, cursorEnabled, artwork, density, colour]);

  // Confetti is fired from outside, so a cart or thank-you moment can trigger it.
  useEffect(() => {
    if (!burstAt || burstAt.seq === lastBurst.current) return;
    lastBurst.current = burstAt.seq;

    for (let index = 0; index < 44; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      confetti.current.push({
        x: burstAt.x,
        y: burstAt.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 5,
        life: 1,
        hue: Math.floor(Math.random() * 360),
      });
    }

    restart.current();
  }, [burstAt]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        // The whole point: an overlay that can never intercept a click.
        pointerEvents: 'none',
      }}
    />
  );
}
