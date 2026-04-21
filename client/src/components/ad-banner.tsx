import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Advertisement } from "@shared/schema";

interface AdBannerProps {
  position: "top_banner" | "inline_card" | "sidebar";
  className?: string;
}

export default function AdBanner({ position, className = "" }: AdBannerProps) {
  const { data } = useQuery<{ ads: Advertisement[] }>({
    queryKey: ["/api/ads", position],
    queryFn: async () => {
      const res = await fetch(`/api/ads?position=${position}`);
      if (!res.ok) return { ads: [] };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const ads = data?.ads || [];
  const ad = ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;
  const trackedRef = useRef<number | null>(null);

  useEffect(() => {
    if (ad && trackedRef.current !== ad.id) {
      trackedRef.current = ad.id;
      fetch(`/api/ads/${ad.id}/impression`, { method: "POST" }).catch(() => {});
    }
  }, [ad?.id]);

  if (!ad) return null;

  const handleClick = () => {
    fetch(`/api/ads/${ad.id}/click`, { method: "POST" }).catch(() => {});
  };

  const content = (
    <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-container-bg">
      <span className="absolute top-1 right-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
        Patrocinado
      </span>
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="w-full h-auto object-cover"
        data-testid={`ad-image-${ad.id}`}
      />
    </div>
  );

  if (ad.linkUrl) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block ${className}`}
        data-testid={`ad-link-${ad.id}`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
