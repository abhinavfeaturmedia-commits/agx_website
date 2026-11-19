import React, { useMemo } from 'react';

export const PETALYX_ASSETS = {
  HERO_VIDEO:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093331_5998f443-1b9c-4b62-820c-8219c73c72c4.mp4',
  HERO_POSTER:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_b7826239-e451-4e15-b42b-d6bcf9497a32.png',
  CLOUD_A:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093216_44218665-b15e-4566-a2d4-2676ab03609d.png',
  CLOUD_B:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_0f37c0c3-f82c-485b-87dd-5a35b75a8782.png',
  TREE:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_95f11900-c4a0-49ad-bb2d-bb927dd594ee.png',
  NIGHT:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093217_cc690198-ad8c-4127-8734-8485bd878351.png',
} as const;

export const AgxPetalyxBrand: React.FC<{
  compact?: boolean;
  className?: string;
}> = ({ compact = false, className = '' }) => (
  <span className={`inline-flex items-center gap-2 text-[#121410] ${className}`}>
    <img
      src="/agx-brandmark.svg"
      alt=""
      width={28}
      height={28}
      className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-[8px] shrink-0 shadow-[0_2px_6px_rgba(18,20,16,0.16)] object-cover"
    />
    <span className="font-semibold text-[16px] sm:text-[18px] tracking-[-0.03em] leading-none">
      AG<span className="text-[var(--olive)] font-bold">X</span>
      {!compact && <span className="font-normal text-[#121410]/75">perience</span>}
    </span>
  </span>
);

interface CherryBlossomBackdropProps {
  petalCount?: number;
  variant?: 'day' | 'night';
  showGlassSquares?: boolean;
}

export const CherryBlossomBackdrop: React.FC<CherryBlossomBackdropProps> = ({
  petalCount = 14,
  variant = 'day',
  showGlassSquares = true,
}) => {
  const petals = useMemo(
    () =>
      Array.from({ length: petalCount }).map((_, i) => ({
        id: i,
        left: `${(i * 7.3 + 4) % 98}%`,
        dx: `${((i % 5) - 2) * 22}px`,
        duration: `${10 + (i % 6) * 1.4}s`,
        delay: `-${(i * 1.25) % 11}s`,
        scale: 0.68 + (i % 4) * 0.16,
      })),
    [petalCount]
  );

  const gridSquares = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${((i * 7 + 2) % 28) * 48 - 10}px`,
        top: `${((i * 3 + 1) % 5) * 48 + 6}px`,
        opacity: 0.3 + (i % 4) * 0.15,
      })),
    []
  );

  const bgImage = variant === 'night' ? PETALYX_ASSETS.NIGHT : PETALYX_ASSETS.HERO_POSTER;

  return (
    <>
      {/* Blurred Cherry Blossom Landscape Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-[-40px] z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: 'center 70%',
          backgroundSize: 'cover',
          filter: 'blur(20px) saturate(1.1)',
          transform: 'scale(1.2)',
          opacity: variant === 'night' ? 0.92 : 0.86,
        }}
      />

      {/* Soft Pastel Sky Gradient Wash for Legibility */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            variant === 'night'
              ? 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.45) 0%, rgba(233,238,224,0.22) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(233,238,224,0.35) 55%, rgba(255,255,255,0.5) 100%)',
        }}
      />

      {/* Subtle Top Grid Squares */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 h-[42%] z-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(#000, transparent)',
          maskImage: 'linear-gradient(#000, transparent)',
        }}
      >
        {gridSquares.map((sq) => (
          <div
            key={sq.id}
            className="petalyx-grid-sq"
            style={{ left: sq.left, top: sq.top, opacity: sq.opacity }}
          />
        ))}
      </div>

      {/* Drifting Pastel Watercolor Clouds + Frosted Glass Accents */}
      <div
        aria-hidden="true"
        className="fixed -top-[3%] -left-[6%] w-[min(40vw,540px)] z-0 pointer-events-none select-none"
      >
        <div className="relative">
          <img src={PETALYX_ASSETS.CLOUD_A} alt="" className="petalyx-drift-a w-full opacity-85" />
          {showGlassSquares && (
            <>
              <div className="petalyx-glass hidden sm:block" style={{ left: '14%', top: '34%', width: '13%', aspectRatio: '1' }} />
              <div className="petalyx-glass hidden sm:block" style={{ left: '30%', top: '52%', width: '10%', aspectRatio: '1' }} />
            </>
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="fixed -bottom-[5%] -right-[6%] w-[min(40vw,540px)] z-0 pointer-events-none select-none"
      >
        <div className="relative">
          <img src={PETALYX_ASSETS.CLOUD_B} alt="" className="petalyx-drift-b w-full opacity-85" />
          {showGlassSquares && (
            <>
              <div className="petalyx-glass hidden sm:block" style={{ right: '18%', top: '26%', width: '12%', aspectRatio: '1' }} />
              <div className="petalyx-glass hidden sm:block" style={{ right: '34%', top: '48%', width: '9%', aspectRatio: '1' }} />
            </>
          )}
        </div>
      </div>

      {/* Falling Cherry Blossom Petals */}
      <div aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="petalyx-petal"
            style={{
              left: petal.left,
              ['--dx' as any]: petal.dx,
              animationDuration: petal.duration,
              animationDelay: petal.delay,
              transform: `scale(${petal.scale})`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export type GatewayType = 'staff' | 'partner' | 'client';

interface AuthGatewayHeaderProps {
  activeGateway: GatewayType;
  badgeLabel: string;
  onBackToWebsite: () => void;
  onSwitchGateway?: (target: GatewayType) => void;
}

export const AuthGatewayHeader: React.FC<AuthGatewayHeaderProps> = ({
  activeGateway,
  badgeLabel,
  onBackToWebsite,
  onSwitchGateway,
}) => {
  return (
    <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#121410]/85 hover:text-[#121410] transition-all px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-black/5 hover:bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] cursor-pointer min-h-[38px]"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Website</span>
        </button>

        {onSwitchGateway && (
          <nav
            aria-label="Portal gateways"
            className="hidden md:inline-flex items-center gap-1 p-1 rounded-full bg-white/85 backdrop-blur-md border border-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
          >
            {(
              [
                { id: 'staff', label: 'Staff' },
                { id: 'partner', label: 'Partner' },
                { id: 'client', label: 'Client Portal' },
              ] as const
            ).map((item) => {
              const isCurrent = activeGateway === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSwitchGateway(item.id)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-xs'
                      : 'text-[#121410]/65 hover:text-[#121410] hover:bg-black/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Floating Pill Brand Lockup */}
      <div className="inline-flex items-center gap-2.5 sm:gap-3 pl-2.5 sm:pl-3 pr-2 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackToWebsite();
          }}
          aria-label="AGXperience home"
          className="hover:opacity-85 transition-opacity"
        >
          <AgxPetalyxBrand />
        </a>
        <span className="petalyx-pill">{badgeLabel}</span>
      </div>
    </header>
  );
};
