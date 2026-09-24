import React, { useEffect } from 'react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RTHUB_GOTO_LOGIN') {
        onGoToLogin();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGoToLogin]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#fffefb]">
      <iframe
        src="/landing.html"
        title="RtHub - Platform Manajemen RT Digital Pintar"
        className="w-full h-full border-none block"
        style={{ width: '100vw', height: '100vh', border: 0 }}
      />
    </div>
  );
};
