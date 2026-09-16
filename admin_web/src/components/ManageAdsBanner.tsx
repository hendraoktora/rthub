import React, { useEffect } from 'react';

interface ManageAdsBannerProps {
  bannerId?: string;
  targetUrl?: string;
  host?: string;
  className?: string;
}

export const ManageAdsBanner: React.FC<ManageAdsBannerProps> = ({
  bannerId = 'ban-mu3usk1d',
  targetUrl = 'https://iconnet.id/promo/promo-september-2026',
  host = 'https://manage-ads-three.vercel.app',
  className = '',
}) => {
  useEffect(() => {
    // Reset loader flag so widget script can re-initialize on SPA mount
    (window as any).__MANAGE_ADS_LOADED__ = false;

    let activeTarget = targetUrl;
    const container = document.getElementById(`mads-${bannerId}`);

    // Observer to ensure href points directly to targetUrl for direct backlink & SEO
    const observer = new MutationObserver(() => {
      const link = container?.querySelector('a');
      if (link && (link.href.includes('/api/c/') || link.href !== activeTarget)) {
        link.href = activeTarget;
        link.rel = 'dofollow';
      }
    });

    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    // Also fetch latest targetUrl from API to keep target link automatically up-to-date
    fetch(`${host}/api/b/${bannerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.banner?.targetUrl) {
          activeTarget = data.banner.targetUrl;
          const link = container?.querySelector('a');
          if (link) {
            link.href = activeTarget;
            link.rel = data.banner.backlinkRel || 'dofollow';
          }
        }
      })
      .catch(() => {});

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
      observer.disconnect();
      const currentScript = document.getElementById(scriptId);
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [bannerId, targetUrl, host]);

  return (
    <div className={`manage-ads-container flex flex-col items-center justify-center w-full ${className}`}>
      {/* ManageADS Dynamic Smart Widget (Auto-Updates & Direct Backlink) */}
      <div
        id={`mads-${bannerId}`}
        data-mads-banner={bannerId}
        data-mads-host={host}
        className="flex justify-center items-center max-w-full overflow-hidden min-h-[45px]"
      />
      <noscript>
        <a href={targetUrl} target="_blank" rel="dofollow">
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
