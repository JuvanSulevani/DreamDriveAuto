import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Dream Drive Auto — Curated Performance & Luxury Automobiles';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0B0B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
        }}
      >
        {/* Top: URL tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '2px', background: '#0E7C73' }} />
          <div
            style={{
              color: '#0E7C73',
              fontSize: '13px',
              letterSpacing: '0.2em',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            dreamdriveauto.ca
          </div>
        </div>

        {/* Center: wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <div
            style={{
              color: '#F2EDE4',
              fontSize: '88px',
              fontWeight: '400',
              letterSpacing: '-0.04em',
              lineHeight: '0.88',
              fontFamily: 'Georgia, serif',
            }}
          >
            Dream Drive
          </div>
          <div
            style={{
              color: '#0E7C73',
              fontSize: '88px',
              fontWeight: '400',
              fontStyle: 'italic',
              letterSpacing: '-0.04em',
              lineHeight: '0.88',
              fontFamily: 'Georgia, serif',
            }}
          >
            Auto.
          </div>
          <div
            style={{
              color: '#8B857A',
              fontSize: '22px',
              fontFamily: 'system-ui, sans-serif',
              marginTop: '28px',
            }}
          >
            Curated Performance &amp; Luxury Automobiles
          </div>
        </div>

        {/* Bottom: location */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            style={{
              color: '#8B857A',
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            London, ON · By Appointment
          </div>
          <div style={{ width: '48px', height: '2px', background: '#26241F' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
