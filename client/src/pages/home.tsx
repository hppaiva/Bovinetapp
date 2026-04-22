import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Megaphone } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";
import type { Advertisement } from "@shared/schema";

function AdCard({ ad }: { ad: Advertisement }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      fetch(`/api/ads/${ad.id}/impression`, { method: "POST" }).catch(() => {});
    }
  }, [ad.id]);

  const handleClick = () => {
    fetch(`/api/ads/${ad.id}/click`, { method: "POST" }).catch(() => {});
  };

  const inner = (
    <Card
      className="bg-[#2A3A4A] border-gray-600 overflow-hidden hover:border-[#4CAF50] transition-all"
      data-testid={`home-ad-${ad.id}`}
    >
      <div className="relative">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <span className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
          Patrocinado
        </span>
      </div>
      <CardContent className="p-4">
        <h3 className="text-white font-semibold text-lg">{ad.title}</h3>
      </CardContent>
    </Card>
  );

  if (ad.linkUrl) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export default function Home() {
  const { data, isLoading } = useQuery<{ ads: Advertisement[] }>({
    queryKey: ["/api/ads"],
    queryFn: async () => {
      const res = await fetch("/api/ads");
      if (!res.ok) return { ads: [] };
      return res.json();
    },
  });

  const ads = data?.ads || [];

  return (
    <div className="min-h-screen bg-[#1E2A38] text-white pb-12">
      <header className="bg-[#2A3A4A] p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={bovinetLogo} alt="Bovinet" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-[#4CAF50]">BOVINET</h1>
              <p className="text-xs text-gray-400">Marketplace do Gado</p>
            </div>
          </div>
          <Link href="/auth">
            <Button
              variant="outline"
              className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
              data-testid="button-admin-login"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <section className="text-center py-6 sm:py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4CAF50] mb-3">
            Ofertas e novidades do agro
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Confira os anúncios em destaque selecionados para produtores rurais e
            compradores de gado em todo o Brasil.
          </p>
        </section>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="text-gray-400 mt-4">Carregando anúncios...</p>
          </div>
        ) : ads.length === 0 ? (
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-10 text-center text-gray-300 space-y-3">
              <Megaphone className="w-10 h-10 mx-auto text-[#4CAF50]" />
              <p className="text-lg font-medium">Nenhum anúncio disponível no momento.</p>
              <p className="text-sm text-gray-400">
                Volte em breve para ver as próximas ofertas!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-500 mt-10 px-4">
        © {new Date().getFullYear()} Bovinet — Conectando o agro do Brasil
      </footer>
    </div>
  );
}
