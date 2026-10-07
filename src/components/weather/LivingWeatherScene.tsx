import React, { useEffect, useRef, useMemo } from 'react';
import { WeatherMetrics, getWeatherCondition } from '../../services/openMeteo';
import { formatUpdatedAgo } from '../../utils/weatherVerdict';
import { MapPin, RefreshCw, Wind, Droplets } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type ResolvedSceneType =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'night';

interface LivingWeatherSceneProps {
  weather: WeatherMetrics | null;
  locationName?: string;
  onRefreshLocation?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const LivingWeatherScene: React.FC<LivingWeatherSceneProps> = ({
  weather,
  locationName = 'Your Location',
  onRefreshLocation,
  isRefreshing = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const scene: ResolvedSceneType = useMemo(() => {
    if (!weather) return 'clear';

    const { weatherCode, isDay, precipitation, visibilityKm, cloudCover } = weather;

    if (!isDay) return 'night';
    if (weatherCode >= 95) return 'storm';
    if (
      precipitation > 0.4 ||
      (weatherCode >= 51 && weatherCode <= 65) ||
      (weatherCode >= 80 && weatherCode <= 82)
    ) {
      return 'rain';
    }
    if (
      weatherCode === 45 ||
      weatherCode === 48 ||
      (visibilityKm != null && visibilityKm <= 3)
    ) {
      return 'fog';
    }
    if (weatherCode >= 2 || cloudCover >= 60) return 'cloudy';
    if (weatherCode === 1 || cloudCover >= 25) return 'partly-cloudy';

    return 'clear';
  }, [weather]);

  const updatedAgo = useMemo(
    () => (weather?.currentTime ? formatUpdatedAgo(weather.currentTime) : 'just now'),
    [weather?.currentTime]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = document.visibilityState === 'visible';

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 320;

    const rainCount = scene === 'storm' ? 80 : scene === 'rain' ? 50 : 0;
    const raindrops: Array<{ x: number; y: number; speed: number; length: number }> = [];
    for (let i = 0; i < rainCount; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: (scene === 'storm' ? 12 : 8) + Math.random() * 3,
        length: 10 + Math.random() * 8,
      });
    }

    const windSpeed = weather?.windSpeed ?? 10;
    const cloudSpeed = Math.max(0.12, Math.min(1.0, windSpeed / 40));
    const clouds: Array<{ x: number; y: number; radius: number; speed: number; opacity: number }> = [
      { x: 50, y: 55, radius: 70, speed: cloudSpeed * 0.3, opacity: 0.18 },
      { x: 200, y: 35, radius: 90, speed: cloudSpeed * 0.4, opacity: 0.22 },
      { x: 360, y: 70, radius: 75, speed: cloudSpeed * 0.35, opacity: 0.16 },
    ];

    const stars: Array<{ x: number; y: number; size: number; alpha: number; delta: number }> = [];
    if (scene === 'night') {
      for (let i = 0; i < 45; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.7),
          size: Math.random() * 1.4 + 0.5,
          alpha: Math.random() * 0.6 + 0.3,
          delta: (Math.random() - 0.5) * 0.01,
        });
      }
    }

    const render = () => {
      const currentWidth = canvas.clientWidth;
      const currentHeight = canvas.clientHeight;
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, currentHeight);

      if (!isDarkMode) {
        if (scene === 'clear') {
          bgGrad.addColorStop(0, '#fef3c7');
          bgGrad.addColorStop(1, '#fcfbf9');
        } else if (scene === 'partly-cloudy') {
          bgGrad.addColorStop(0, '#e8ece9');
          bgGrad.addColorStop(1, '#fcfbf9');
        } else if (scene === 'cloudy') {
          bgGrad.addColorStop(0, '#e2e5e2');
          bgGrad.addColorStop(1, '#f6f4ee');
        } else if (scene === 'rain') {
          bgGrad.addColorStop(0, '#dce3e0');
          bgGrad.addColorStop(1, '#fcfbf9');
        } else if (scene === 'fog') {
          bgGrad.addColorStop(0, '#edebe4');
          bgGrad.addColorStop(1, '#f6f4ee');
        } else {
          bgGrad.addColorStop(0, '#1c2420');
          bgGrad.addColorStop(1, '#0e1411');
        }
      } else {
        if (scene === 'clear') {
          bgGrad.addColorStop(0, 'rgba(194, 94, 0, 0.18)');
          bgGrad.addColorStop(1, '#121619');
        } else if (scene === 'partly-cloudy' || scene === 'cloudy') {
          bgGrad.addColorStop(0, 'rgba(30, 40, 35, 0.65)');
          bgGrad.addColorStop(1, '#121619');
        } else if (scene === 'rain' || scene === 'storm') {
          bgGrad.addColorStop(0, 'rgba(20, 30, 26, 0.85)');
          bgGrad.addColorStop(1, '#0c0e10');
        } else {
          bgGrad.addColorStop(0, 'rgba(18, 26, 22, 0.95)');
          bgGrad.addColorStop(1, '#0c0e10');
        }
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, currentWidth, currentHeight);

      if (scene === 'clear' || scene === 'partly-cloudy') {
        const sunX = currentWidth * 0.85;
        const sunY = currentHeight * 0.28;
        const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 80);
        glow.addColorStop(0, isDarkMode ? 'rgba(224, 122, 34, 0.25)' : 'rgba(194, 94, 0, 0.2)');
        glow.addColorStop(1, 'rgba(224, 122, 34, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDarkMode ? '#e07a22' : '#c25e00';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fill();
      } else if (scene === 'night') {
        const moonX = currentWidth * 0.85;
        const moonY = currentHeight * 0.28;
        ctx.fillStyle = 'rgba(240, 244, 241, 0.85)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
        ctx.fill();

        stars.forEach((star) => {
          star.alpha += star.delta;
          if (star.alpha > 0.8 || star.alpha < 0.2) star.delta = -star.delta;
          ctx.fillStyle = `rgba(240, 244, 241, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (['partly-cloudy', 'cloudy', 'storm', 'fog', 'rain'].includes(scene)) {
        clouds.forEach((cloud) => {
          if (!prefersReducedMotion) {
            cloud.x += cloud.speed;
            if (cloud.x - cloud.radius > currentWidth) cloud.x = -cloud.radius;
          }
          const cloudGrad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.radius);
          const color = !isDarkMode ? '255, 255, 255' : '130, 140, 134';
          cloudGrad.addColorStop(0, `rgba(${color}, ${cloud.opacity})`);
          cloudGrad.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (['rain', 'storm'].includes(scene)) {
        ctx.strokeStyle = !isDarkMode ? 'rgba(56, 100, 112, 0.35)' : 'rgba(90, 138, 153, 0.4)';
        ctx.lineWidth = 1.2;
        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 1.5, drop.y + drop.length);
          ctx.stroke();

          if (!prefersReducedMotion) {
            drop.y += drop.speed;
            if (drop.y > currentHeight) {
              drop.y = -10;
              drop.x = Math.random() * currentWidth;
            }
          }
        });
      }

      if (isVisible && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [scene, weather, isDarkMode]);

  const isNightScene = scene === 'night';
  const isLightModeNight = !isDarkMode && isNightScene;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isDarkMode
          ? 'border-slate-800/60 bg-slate-900/40'
          : 'border-stone-200/80 bg-stone-50/60'
      } transition-colors duration-200 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />

      <div
        className={`relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full space-y-6 ${
          isLightModeNight
            ? 'text-white'
            : isDarkMode
            ? 'text-emerald-50'
            : 'text-stone-900'
        }`}
      >
        {/* Header Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin
              size={15}
              className={
                isLightModeNight
                  ? 'text-emerald-400'
                  : 'text-[var(--accent-primary)]'
              }
            />
            <h2 className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {locationName}
            </h2>
            <span
              className={`text-[11px] font-normal hidden sm:inline ${
                isLightModeNight
                  ? 'text-stone-300'
                  : isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }`}
            >
              · Open-Meteo · Updated {updatedAgo}
            </span>
          </div>

          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              className={`flex items-center gap-1.5 text-xs transition-colors py-1 px-2.5 rounded-lg border ${
                isLightModeNight
                  ? 'bg-stone-800/70 border-stone-700 text-stone-200 hover:text-white'
                  : isDarkMode
                  ? 'bg-stone-800/60 border-stone-700/80 text-stone-300 hover:text-white'
                  : 'bg-white/70 border-stone-200 text-stone-700 hover:text-stone-900'
              }`}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[var(--accent-primary)]' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}
        </div>

        {/* Strong, Elegant Temperature Typography */}
        <div className="space-y-5">
          <div>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl sm:text-8xl font-extralight tracking-tighter tabular-nums leading-none">
                {weather?.currentTemp ?? '--'}°
              </span>
              <span
                className={`text-xl sm:text-2xl font-light tracking-wide ${
                  isLightModeNight
                    ? 'text-stone-200'
                    : isDarkMode
                    ? 'text-stone-300'
                    : 'text-stone-700'
                }`}
              >
                {weather?.weatherCondition || getWeatherCondition(weather?.weatherCode ?? 0)}
              </span>
            </div>

            <p
              className={`text-xs tabular-nums mt-2 font-medium tracking-wide ${
                isLightModeNight
                  ? 'text-stone-300'
                  : isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }`}
            >
              Feels like {weather?.feelsLike ?? '--'}° &nbsp;·&nbsp; High {weather?.tempHigh ?? '--'}° &nbsp;·&nbsp; Low {weather?.tempLow ?? '--'}°
            </p>
          </div>

          {/* Wind & Precipitation Strip */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-6 backdrop-blur-xs ${
              isLightModeNight
                ? 'bg-stone-800/60 border-stone-700/80 text-stone-100'
                : isDarkMode
                ? 'bg-stone-800/60 border-stone-700/80 text-stone-100'
                : 'bg-white/80 border-stone-200/90 text-stone-800'
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Wind size={15} className="text-[var(--accent-primary)] shrink-0" />
              <span>
                Wind:{' '}
                <strong className="font-semibold">
                  {weather?.windSpeed ?? 0} km/h
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Droplets size={15} className="text-[var(--accent-rain)] shrink-0" />
              <span>
                Precipitation:{' '}
                <strong className="font-semibold">
                  {weather?.precipitation ?? 0} mm
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};