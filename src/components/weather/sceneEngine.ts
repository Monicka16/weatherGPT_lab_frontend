export type SceneKind = 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm' | 'fog';

export interface SceneOptions {
  kind: SceneKind;
  night: boolean;
  dark: boolean;
  windSpeed: number;
  precipitation: number;
}

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ---------- theme: reads the app's own CSS variables so the scene matches the UI ----------
type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const csv = (c: RGB) => c.join(',');
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function parseColor(v: string): RGB | null {
  // "194 94 0" / "194, 94, 0" channel triples
  const tri = v.match(/^(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)$/);
  if (tri) return [Math.round(+tri[1]), Math.round(+tri[2]), Math.round(+tri[3])];
  // anything else the browser understands (hex, rgb(), hsl(), names)
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return null;
  c.fillStyle = '#010203';
  c.fillStyle = v;
  const out = String(c.fillStyle);
  if (out === '#010203') return null;
  if (out.startsWith('#')) {
    const n = parseInt(out.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = out.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [Math.round(p[0]), Math.round(p[1]), Math.round(p[2])];
}

function readColor(names: string[], fallback: RGB): RGB {
  const cs = getComputedStyle(document.documentElement);
  for (const n of names) {
    const v = cs.getPropertyValue(n).trim();
    if (v) {
      const p = parseColor(v);
      if (p) return p;
    }
  }
  return fallback;
}

function buildTheme({ kind, night, dark }: SceneOptions) {
  const heavy = kind === 'rain' || kind === 'storm';
  const accent = readColor(['--accent-primary'], dark ? [74, 155, 115] : [47, 110, 80]);
  const sunC = readColor(['--accent-sun', '--accent-warm'], dark ? [224, 122, 34] : [194, 94, 0]);
  const rainC = readColor(['--accent-rain'], dark ? [90, 138, 153] : [56, 100, 112]);
  const surface = readColor(
    ['--bg-surface', '--bg-base', '--bg-primary'],
    dark ? [18, 22, 25] : [252, 251, 249]
  );

  // sky: the surface colour at the bottom (so the card melts into the page), tinted at the top
  let top: RGB;
  let bottom: RGB = surface;
  if (night) {
    top = mix(heavy ? [22, 29, 26] : [28, 36, 32], accent, 0.1);
    bottom = heavy ? [10, 14, 12] : [14, 20, 17];
  } else if (dark) {
    const tint: Record<SceneKind, [RGB, number]> = {
      clear: [sunC, 0.2],
      'partly-cloudy': [[60, 78, 68], 0.6],
      cloudy: [[60, 78, 68], 0.65],
      rain: [mix([30, 44, 50], rainC, 0.3), 0.7],
      storm: [[26, 36, 40], 0.85],
      fog: [[96, 106, 100], 0.4],
    };
    top = mix(surface, tint[kind][0], tint[kind][1]);
  } else {
    const tint: Record<SceneKind, [RGB, number]> = {
      clear: [sunC, 0.16],
      'partly-cloudy': [mix([160, 185, 188], accent, 0.1), 0.38],
      cloudy: [mix([150, 158, 153], accent, 0.1), 0.32],
      rain: [mix([120, 140, 146], rainC, 0.3), 0.38],
      storm: [mix([78, 92, 98], rainC, 0.2), 0.45],
      fog: [[205, 200, 188], 0.5],
    };
    top = mix(surface, tint[kind][0], tint[kind][1]);
  }

  // clouds
  let cloud: { top: RGB; bottom: RGB; alpha: number };
  if (night) {
    cloud = heavy
      ? { top: [52, 62, 62], bottom: [26, 32, 32], alpha: 0.8 }
      : { top: [70, 84, 80], bottom: [38, 48, 45], alpha: 0.6 };
  } else if (dark) {
    cloud =
      kind === 'storm'
        ? { top: [68, 78, 80], bottom: [38, 46, 48], alpha: 0.85 }
        : kind === 'rain'
        ? { top: [90, 102, 100], bottom: [56, 66, 64], alpha: 0.7 }
        : { top: [120, 132, 127], bottom: [78, 90, 85], alpha: 0.55 };
  } else {
    cloud =
      kind === 'storm'
        ? { top: mix([150, 162, 164], rainC, 0.15), bottom: mix([104, 118, 124], rainC, 0.2), alpha: 0.95 }
        : kind === 'rain'
        ? { top: mix([196, 206, 206], rainC, 0.15), bottom: mix([150, 163, 164], rainC, 0.2), alpha: 0.9 }
        : { top: mix(surface, [255, 255, 255], 0.7), bottom: mix([214, 222, 218], accent, 0.08), alpha: 0.92 };
  }
  const cloudAlpha = kind === 'fog' ? cloud.alpha * 0.6 : cloud.alpha;

  // hills pick up the app's primary accent
  const hills: [string, string] = night
    ? [rgba(mix([40, 56, 48], accent, 0.12), 0.55), rgba(mix([22, 32, 27], accent, 0.1), 0.8)]
    : dark
    ? [rgba(mix([60, 78, 68], accent, 0.2), 0.35), rgba(mix([34, 46, 40], accent, 0.15), 0.55)]
    : [rgba(mix([170, 185, 172], accent, 0.28), 0.32), rgba(mix([140, 160, 145], accent, 0.38), 0.36)];

  return {
    sky: [rgba(top, 1), rgba(bottom, 1)] as [string, string],
    cloud: { top: csv(cloud.top), bottom: csv(cloud.bottom), alpha: cloudAlpha },
    hills,
    rain: csv(dark || night ? mix(rainC, [210, 235, 245], 0.35) : mix(rainC, [20, 40, 50], 0.2)),
    sun: csv(sunC),
    mist: night ? '90,104,98' : dark ? '110,122,116' : csv(mix(surface, [255, 255, 255], 0.5)),
  };
}

const CLOUD_COUNT: Record<SceneKind, number> = {
  clear: 1,
  'partly-cloudy': 3,
  cloudy: 6,
  rain: 6,
  storm: 7,
  fog: 2,
};
// how much of the sun / moon / stars shows through
const SKY_BODY: Record<SceneKind, number> = {
  clear: 1,
  'partly-cloudy': 1,
  cloudy: 0.4,
  fog: 0.3,
  rain: 0,
  storm: 0,
};

// Real moon phase (0 = new, 0.5 = full), from the synodic month
function moonPhase() {
  const month = 29.530588853;
  const days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  return (((days % month) + month) % month) / month;
}

// Rain layers: far -> near. Far drops land higher up, near ones lower, which gives depth.
const LAYERS = [
  { v: 380, len: 8, lw: 0.8, a: 0.25, g: 0.8 },
  { v: 560, len: 13, lw: 1.1, a: 0.35, g: 0.88 },
  { v: 780, len: 20, lw: 1.5, a: 0.45, g: 0.97 },
];

type Cloud = { x: number; y: number; s: number; ph: number; bumps: [number, number, number][] };
type Drop = { l: number; x: number; y: number; gy: number };
type Ripple = { x: number; y: number; age: number; life: number; r: number };
type Star = { x: number; y: number; r: number; ph: number; sp: number; spark: boolean };
type Puff = { x: number; y: number; rx: number; sp: number; ph: number; a: number };
type Pt = [number, number];

export function startScene(canvas: HTMLCanvasElement, opts: SceneOptions): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const { kind, night, dark, windSpeed, precipitation } = opts;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let th = buildTheme(opts);
  const lightDay = !night && !dark;
  const bodyA = SKY_BODY[kind];
  const raining = kind === 'rain' || kind === 'storm';
  const slope = clamp(windSpeed / 25, 0.08, 0.6);
  const cloudPxPerSec = (4 + clamp(windSpeed, 0, 60) * 0.6) * 0.6;
  const phase = moonPhase();

  let w = 600;
  let h = 320;
  let hills: { pts: number[]; fill: string }[] = [];
  let clouds: Cloud[] = [];
  let stars: Star[] = [];
  let drops: Drop[] = [];
  let ripples: Ripple[] = [];
  let puffs: Puff[] = [];
  let shoot: { x: number; y: number; vx: number; vy: number; age: number } | null = null;
  let nextShoot = rand(5, 10);
  let bolt: { pts: Pt[]; br: Pt[] } | null = null;
  let boltAge = -1;
  let nextBolt = rand(2, 5);

  // ---------- builders ----------
  const makeHill = (base: number, amp: number, fill: string) => {
    const p1 = rand(0, TAU);
    const p2 = rand(0, TAU);
    const pts: number[] = [];
    for (let x = 0; x <= w + 8; x += 8) {
      pts.push(h * (base + amp * (Math.sin((x / w) * 3.1 + p1) * 0.6 + Math.sin((x / w) * 7.3 + p2) * 0.4)));
    }
    return { pts, fill };
  };

  const makeCloud = (x: number, y: number, s: number): Cloud => {
    const n = 5 + Math.floor(Math.random() * 3);
    const bumps: [number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const r = 14 + Math.sin(t * Math.PI) * 18 + rand(-3, 4);
      bumps.push([(t - 0.5) * 100, -r * 0.62, r]);
    }
    return { x, y, s, ph: rand(0, TAU), bumps };
  };

  const newDrop = (l: number, anywhere: boolean): Drop => ({
    l,
    x: rand(-0.25 * w, w),
    y: anywhere ? rand(-h * 0.2, h * LAYERS[l].g) : -LAYERS[l].len,
    gy: h * (LAYERS[l].g + rand(-0.03, 0.02)),
  });

  const makeBolt = () => {
    const pts: Pt[] = [];
    let x = rand(0.2, 0.8) * w;
    let y = h * 0.16;
    const steps = 9;
    const dy = (h * 0.62) / steps;
    pts.push([x, y]);
    for (let i = 0; i < steps; i++) {
      x += rand(-24, 24);
      y += dy * rand(0.8, 1.2);
      pts.push([x, y]);
    }
    const from = pts[3 + Math.floor(Math.random() * 3)];
    const dir = Math.random() < 0.5 ? -1 : 1;
    const br: Pt[] = [from];
    let bx = from[0];
    let by = from[1];
    for (let i = 0; i < 3; i++) {
      bx += dir * rand(10, 24);
      by += rand(12, 24);
      br.push([bx, by]);
    }
    return { pts, br };
  };

  const seed = () => {
    hills = [makeHill(0.8, 0.05, th.hills[0]), makeHill(0.9, 0.04, th.hills[1])];

    clouds = [];
    for (let i = 0; i < CLOUD_COUNT[kind]; i++) {
      const yf = rand(0.08, 0.4);
      clouds.push(makeCloud(rand(-0.1, 1.1) * w, yf * h, 0.7 + ((yf - 0.08) / 0.32) * 0.9));
    }
    clouds.sort((a, b) => a.s - b.s); // far clouds first

    stars = night
      ? Array.from({ length: 55 }, () => ({
          x: rand(0, w),
          y: rand(0, h * 0.6),
          r: rand(0.5, 1.5),
          ph: rand(0, TAU),
          sp: rand(0.8, 2.2),
          spark: Math.random() < 0.12,
        }))
      : [];

    const count = raining
      ? Math.round((kind === 'storm' ? 120 : 44 + clamp(precipitation, 0, 6) * 14) * clamp(w / 600, 0.7, 1.6))
      : 0;
    drops = Array.from({ length: count }, () => {
      const r = Math.random();
      return newDrop(r < 0.4 ? 0 : r < 0.75 ? 1 : 2, true);
    });
    ripples = [];

    puffs =
      kind === 'fog'
        ? Array.from({ length: 9 }, () => ({
            x: rand(-0.2, 1.2) * w,
            y: rand(0.45, 0.95) * h,
            rx: rand(140, 260),
            sp: rand(5, 14),
            ph: rand(0, TAU),
            a: rand(0.6, 1),
          }))
        : [];
  };

  // ---------- drawing pieces ----------
  const drawSun = (x: number, y: number, t: number) => {
    const halo = ctx.createRadialGradient(x, y, 24, x, y, 120);
    halo.addColorStop(0, `rgba(${th.sun},${dark ? 0.22 : 0.3})`);
    halo.addColorStop(1, `rgba(${th.sun},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, 120, 0, TAU);
    ctx.fill();

    // tapered rays, alternating long/short, slowly turning and breathing
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.05);
    ctx.fillStyle = `rgba(${th.sun},0.7)`;
    for (let i = 0; i < 16; i++) {
      const len = (i % 2 ? 14 : 30) + Math.sin(t * 0.9 + i * 1.7) * 3;
      ctx.save();
      ctx.rotate((i / 16) * TAU);
      ctx.beginPath();
      ctx.moveTo(40, -3);
      ctx.lineTo(40 + len, 0);
      ctx.lineTo(40, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = `rgb(${th.sun})`;
    ctx.beginPath();
    ctx.arc(x, y, 31, 0, TAU);
    ctx.fill();
  };

  const drawMoon = (x: number, y: number, r: number, t: number) => {
    const glow = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 3.4);
    glow.addColorStop(0, `rgba(214,226,232,${0.14 + Math.sin(t * 0.4) * 0.03})`);
    glow.addColorStop(1, 'rgba(214,226,232,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.4, 0, TAU);
    ctx.fill();

    // unlit side, faint
    ctx.fillStyle = 'rgba(238,242,236,0.08)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    // lit side from the real phase: limb on one side, terminator ellipse on the other
    const sgn = phase < 0.5 ? 1 : -1;
    const k = Math.cos(phase * TAU);
    ctx.fillStyle = 'rgba(238,242,236,0.93)';
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / 24;
      const px = x + sgn * r * Math.cos(a);
      const py = y + r * Math.sin(a);
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    for (let i = 24; i >= 0; i--) {
      const a = -Math.PI / 2 + (Math.PI * i) / 24;
      ctx.lineTo(x + sgn * k * r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawCloud = (c: Cloud, t: number, boost: number) => {
    const a = clamp(th.cloud.alpha + boost, 0, 1);
    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(t * 0.25 + c.ph) * 2);
    ctx.scale(c.s, c.s);
    ctx.beginPath();
    ctx.rect(-90, -90, 180, 90); // flat base
    ctx.clip();
    const g = ctx.createLinearGradient(0, -50, 0, 0);
    g.addColorStop(0, `rgba(${th.cloud.top},${a})`);
    g.addColorStop(1, `rgba(${th.cloud.bottom},${a})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    for (const [dx, dy, r] of c.bumps) {
      ctx.moveTo(dx + r, dy);
      ctx.arc(dx, dy, r, 0, TAU);
    }
    ctx.fill();
    ctx.restore();
  };

  const flash = (a: number) =>
    a < 0.07 ? 1 : a < 0.13 ? 0.2 : a < 0.2 ? 0.85 : Math.max(0, 0.85 * Math.exp(-(a - 0.2) * 7));

  const strokePath = (pts: Pt[]) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
  };

  const drawBolt = (b: { pts: Pt[]; br: Pt[] }, f: number) => {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (lightDay) {
      ctx.strokeStyle = `rgba(60,72,95,${0.3 * f})`;
      ctx.lineWidth = 5;
      strokePath(b.pts);
    }
    ctx.shadowColor = lightDay ? 'rgba(214,150,20,0.9)' : 'rgba(200,220,255,0.9)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(255,252,240,${f})`;
    ctx.lineWidth = 2.2;
    strokePath(b.pts);
    ctx.lineWidth = 1.2;
    strokePath(b.br);
    ctx.restore();
  };

  // ---------- frame ----------
  const draw = (dt: number, t: number) => {
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, th.sky[0]);
    bg.addColorStop(1, th.sky[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // lightning timing (storm only)
    let f = 0;
    if (kind === 'storm' && !reduced) {
      nextBolt -= dt;
      if (nextBolt <= 0) {
        bolt = makeBolt();
        boltAge = 0;
        nextBolt = rand(4, 9);
      }
      if (boltAge >= 0) {
        boltAge += dt;
        if (boltAge > 1) boltAge = -1;
      }
      f = boltAge >= 0 ? flash(boltAge) : 0;
    }

    // sun / moon / stars
    if (bodyA > 0) {
      ctx.save();
      ctx.globalAlpha = bodyA;
      if (night) {
        for (const s of stars) {
          const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
          ctx.fillStyle = `rgba(240,244,241,${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, TAU);
          ctx.fill();
          if (s.spark) {
            ctx.strokeStyle = `rgba(240,244,241,${a * 0.7})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(s.x - s.r * 3.5, s.y);
            ctx.lineTo(s.x + s.r * 3.5, s.y);
            ctx.moveTo(s.x, s.y - s.r * 3.5);
            ctx.lineTo(s.x, s.y + s.r * 3.5);
            ctx.stroke();
          }
        }
        drawMoon(w * 0.85, h * 0.28, 26, t);

        // the occasional shooting star
        if (!reduced && bodyA >= 1) {
          nextShoot -= dt;
          if (nextShoot <= 0 && !shoot) {
            const ang = rand(0.45, 0.6);
            shoot = { x: rand(0.1, 0.65) * w, y: rand(0.05, 0.3) * h, vx: Math.cos(ang) * 420, vy: Math.sin(ang) * 420, age: 0 };
            nextShoot = rand(7, 14);
          }
          if (shoot) {
            shoot.age += dt;
            shoot.x += shoot.vx * dt;
            shoot.y += shoot.vy * dt;
            const p = shoot.age / 0.9;
            if (p >= 1) shoot = null;
            else {
              const tail = ctx.createLinearGradient(shoot.x - shoot.vx * 0.14, shoot.y - shoot.vy * 0.14, shoot.x, shoot.y);
              tail.addColorStop(0, 'rgba(240,244,241,0)');
              tail.addColorStop(1, `rgba(240,244,241,${(1 - p) * 0.9})`);
              ctx.strokeStyle = tail;
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.moveTo(shoot.x - shoot.vx * 0.14, shoot.y - shoot.vy * 0.14);
              ctx.lineTo(shoot.x, shoot.y);
              ctx.stroke();
            }
          }
        }
      } else {
        drawSun(w * 0.85, h * 0.28, t);
      }
      ctx.restore();
    }

    // hills
    for (const hill of hills) {
      ctx.fillStyle = hill.fill;
      ctx.beginPath();
      ctx.moveTo(0, h);
      hill.pts.forEach((py, i) => ctx.lineTo(i * 8, py));
      ctx.lineTo(w + 8, h);
      ctx.closePath();
      ctx.fill();
    }

    // clouds
    for (const c of clouds) {
      if (!reduced) {
        c.x += cloudPxPerSec * c.s * dt;
        if (c.x - 90 * c.s > w) c.x = -90 * c.s;
      }
      drawCloud(c, t, f * 0.15);
    }

    // fog: drifting mist banks
    for (const p of puffs) {
      if (!reduced) {
        p.x += p.sp * dt;
        if (p.x - p.rx > w) p.x = -p.rx;
      }
      ctx.save();
      ctx.translate(p.x, p.y + Math.sin(t * 0.2 + p.ph) * 6);
      ctx.scale(1, 0.22);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.rx);
      g.addColorStop(0, `rgba(${th.mist},${0.7 * p.a})`);
      g.addColorStop(1, `rgba(${th.mist},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, p.rx, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // rain, leaning with the wind, with ripples where drops land
    if (raining) {
      ctx.lineCap = 'round';
      for (const d of drops) {
        const L = LAYERS[d.l];
        if (!reduced) {
          d.y += L.v * dt;
          d.x += L.v * slope * dt;
          if (d.y >= d.gy) {
            if (d.l > 0 && ripples.length < 28 && Math.random() < 0.5) {
              ripples.push({ x: d.x, y: d.gy, age: 0, life: rand(0.5, 0.9), r: rand(6, 14) * (d.l === 2 ? 1.3 : 1) });
            }
            Object.assign(d, newDrop(d.l, false));
          }
        }
        ctx.strokeStyle = `rgba(${th.rain},${L.a})`;
        ctx.lineWidth = L.lw;
        ctx.beginPath();
        ctx.moveTo(d.x - slope * L.len, d.y - L.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      ripples = ripples.filter((r) => (r.age += dt) < r.life);
      ctx.lineWidth = 1;
      for (const r of ripples) {
        const p = r.age / r.life;
        const rr = r.r * (0.3 + p * 0.7);
        ctx.strokeStyle = `rgba(${th.rain},${(1 - p) * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rr, rr * 0.28, 0, 0, TAU);
        ctx.stroke();
      }
    }

    // lightning bolt + screen flash
    if (f > 0 && bolt) {
      if (boltAge < 0.28) drawBolt(bolt, f);
      ctx.fillStyle = lightDay ? `rgba(255,248,220,${f * 0.4})` : `rgba(190,210,255,${f * 0.18})`;
      ctx.fillRect(0, 0, w, h);
    }
  };

  // ---------- lifecycle ----------
  const init = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width || 600;
    h = rect.height || 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduced) draw(0, 0);
  };

  let raf = 0;
  let last = 0;
  let time = 0;
  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    time += dt;
    draw(dt, time);
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || reduced) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop());

  const applyTheme = () => {
    th = buildTheme(opts);
    if (hills.length > 1) {
      hills[0].fill = th.hills[0];
      hills[1].fill = th.hills[1];
    }
    if (reduced) draw(0, 0);
  };

  init();
  const ro = new ResizeObserver(init);
  // the app switches light/dark by changing attributes on <html>/<body>; re-read the CSS variables when that happens
  const mo = new MutationObserver(applyTheme);
  [document.documentElement, document.body].forEach((el) =>
    mo.observe(el, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
  );
  ro.observe(canvas);
  document.addEventListener('visibilitychange', onVisibility);
  start();

  return () => {
    stop();
    ro.disconnect();
    mo.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}