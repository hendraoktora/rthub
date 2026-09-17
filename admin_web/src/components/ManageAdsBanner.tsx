import React, { useEffect } from 'react';

interface ManageAdsBannerProps {
  bannerId?: string;
  carouselId?: string;
  targetUrl?: string;
  host?: string;
  className?: string;
}

export const ManageAdsBanner: React.FC<ManageAdsBannerProps> = ({
  bannerId,
  carouselId = 'car-mu55lqzr-mavc',
  targetUrl = 'https://iconnet.id/promo/promo-september-2026',
  host = 'https://manage-ads-three.vercel.app',
  className = '',
}) => {
  const isCarousel = Boolean(carouselId);
  const elementId = isCarousel ? `mads-${carouselId}` : `mads-${bannerId}`;

  useEffect(() => {
    // Reset loader flag so widget script can re-initialize on SPA mount
    (window as any).__MANAGE_ADS_LOADED__ = false;

    const container = document.getElementById(elementId);
    let observer: MutationObserver | null = null;

    if (!isCarousel && bannerId) {
      let activeTarget = targetUrl;
      observer = new MutationObserver(() => {
        const link = container?.querySelector('a');
        if (link && (link.href.includes('/api/c/') || link.href !== activeTarget)) {
          link.href = activeTarget;
          link.rel = 'dofollow';
        }
      });

      if (container) {
        observer.observe(container, { childList: true, subtree: true });
      }

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
    }

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
      if (observer) {
        observer.disconnect();
      }
      const currentScript = document.getElementById(scriptId);
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [bannerId, carouselId, isCarousel, elementId, targetUrl, host]);

  return (
    <div className={`manage-ads-container flex flex-col items-center justify-center w-full ${className}`}>
      {isCarousel ? (
        /* ManageADS Dynamic Carousel Slider (Promo ICONNET SETIA - 2 Banner) */
        <div
          id={`mads-${carouselId}`}
          data-mads-carousel={carouselId}
          data-mads-host={host}
          className="flex justify-center items-center max-w-full overflow-hidden min-h-[50px]"
        />
      ) : (
        /* ManageADS Dynamic Smart Widget (Auto-Updates & Direct Backlink) */
        <>
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
        </>
      )}
    </div>
  );
};
