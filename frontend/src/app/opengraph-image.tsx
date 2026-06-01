import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CallGenie AI — AI Voice Agents That Call Your Leads For You';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #141422 60%, #1e1b4b 100%)',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            📞
          </div>
          <div style={{ fontSize: '40px', fontWeight: 700, color: '#ffffff' }}>
            CallGenie AI
          </div>
        </div>
        <div
          style={{
            fontSize: '68px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            maxWidth: '900px',
          }}
        >
          AI voice agents that call your leads for you
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#a1a1aa',
            marginTop: '28px',
            maxWidth: '880px',
          }}
        >
          Automate outbound calls, qualify leads, and book appointments — at 1/10th the cost.
        </div>
      </div>
    ),
    { ...size }
  );
}
