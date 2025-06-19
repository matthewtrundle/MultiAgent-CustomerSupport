import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 80, marginRight: 20 }}>🧠</span>
          <span style={{ fontSize: 80, marginRight: 20 }}>💚</span>
          <span style={{ fontSize: 80, marginRight: 20 }}>📊</span>
          <span style={{ fontSize: 80, marginRight: 20 }}>🏗️</span>
          <span style={{ fontSize: 80 }}>🚀</span>
        </div>
        <h1
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            marginTop: 20,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          AI Brain Trust
        </h1>
        <p
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          Watch 5 AI agents with unique personalities debate and solve problems together
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 40,
            opacity: 0.8,
          }}
        >
          <span style={{ color: 'white', fontSize: 16 }}>#AI</span>
          <span style={{ color: 'white', fontSize: 16 }}>•</span>
          <span style={{ color: 'white', fontSize: 16 }}>#MultiAgentSystems</span>
          <span style={{ color: 'white', fontSize: 16 }}>•</span>
          <span style={{ color: 'white', fontSize: 16 }}>#Innovation</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}