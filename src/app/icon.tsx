import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#08080a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#67e8f9',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.05em',
        }}
      >
        RF
      </div>
    ),
    { ...size }
  );
}
