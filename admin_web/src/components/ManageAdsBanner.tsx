import React, { useEffect } from 'react';

interface ManageAdsBannerProps {
  bannerId?: string;
  host?: string;
  className?: string;
}

export const ManageAdsBanner: React.FC<ManageAdsBannerProps> = ({
  bannerId = 'ban-mu3ryzku',
  host = 'https://manage-ads-three.vercel.app',
  className = '',
}) => {
  useEffect(() => {
    // Reset loader flag so widget script can re-initialize on SPA mount
    (window as any).__MANAGE_ADS_LOADED__ = false;

    const scriptId = 'manage-ads-script';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `${host}/widget.js?v=${Date.now()}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const currentScript = document.getElementById(scriptId);
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [bannerId, host]);

  return (
    <div className={`manage-ads-container flex flex-col items-center justify-center w-full ${className}`}>
      {/* ManageADS Dynamic Smart Widget (Auto-Updates) */}
      <div
        id={`mads-${bannerId}`}
        data-mads-banner={bannerId}
        data-mads-host={host}
        className="flex justify-center items-center max-w-full overflow-hidden min-h-[45px]"
      />
      <noscript>
        <a href={`${host}/api/c/${bannerId}`} target="_blank" rel="dofollow">
          <img
            src={`${host}/api/b/${bannerId}/image`}
            alt="Solusi Bisnis Digital Terbaik"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </a>
      </noscript>
    </div>
  );
};
