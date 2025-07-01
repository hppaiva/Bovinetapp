import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/loading-spinner";
import { MapPin, Clock, ArrowRight, User as UserIcon, Plus } from "lucide-react";
import type { User, Freight } from "@shared/schema";

export default function ProducerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('current_user');
    if (!userData) {
      setLocation('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'producer') {
      setLocation('/');
      return;
    }
    
    setUser(parsedUser);
  }, [setLocation]);

  const { data: freights = [], isLoading } = useQuery({
    queryKey: ['/api/freights/producer', user?.id],
    enabled: !!user?.id,
  });

  if (!user) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const activeFreights = Array.isArray(freights) ? freights.filter((f: any) => f.status !== 'completed') : [];
  const completedFreights = Array.isArray(freights) ? freights.filter((f: any) => f.status === 'completed') : [];

  return (
    <div className="app-container">
      <div className="min-h-screen bg-gray-50">
        {/* Uber-style Header */}
        <div className="uber-header px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">Olá, {user.name}</h2>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{user.location || 'Localização não definida'}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <UserIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Request */}
        <div className="px-6 py-6">
          <div className="uber-card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black">Onde você quer enviar?</h3>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Link href="/livestock-form">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🐄</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">Carga Viva</div>
                    <div className="text-sm text-gray-600">Gado, cavalos, etc.</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>

              <Link href="/grains-form">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌾</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">Grãos</div>
                    <div className="text-sm text-gray-600">Milho, soja, café</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* Active Shipments */}
          {activeFreights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Fretes ativos</h3>
              <div className="space-y-3">
                {activeFreights.slice(0, 2).map((freight: any) => (
                  <div key={freight.id} className="uber-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">
                            {freight.cargoType === 'livestock' ? '🐄' : '🌾'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-black">
                            {freight.quantity} {freight.cargoType === 'livestock' ? freight.animalType : 'ton'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {freight.origin?.split(',')[0]} → {freight.destination?.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        freight.status === 'pending' ? 'status-waiting' :
                        freight.status === 'quoted' ? 'status-active' :
                        'status-completed'
                      }`}>
                        {freight.status === 'pending' ? 'Aguardando' : 
                         freight.status === 'quoted' ? 'Cotações' :
                         freight.status === 'accepted' ? 'Confirmado' : freight.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Hoje</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-black font-medium">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="uber-card p-6 mb-6">
            <h3 className="font-semibold text-black mb-4">Resumo</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-black">{Array.isArray(freights) ? freights.length : 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedFreights.length}</div>
                <div className="text-sm text-gray-600">Entregues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{activeFreights.length}</div>
                <div className="text-sm text-gray-600">Ativos</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {isLoading ? (
            <div className="uber-card p-6">
              <LoadingSpinner />
            </div>
          ) : Array.isArray(freights) && freights.length > 0 ? (
            <div className="uber-card p-6">
              <h3 className="font-semibold text-black mb-4">Atividade recente</h3>
              <div className="space-y-4">
                {freights.slice(0, 3).map((freight: any) => (
                  <div key={freight.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">
                        {freight.cargoType === 'livestock' ? '🐄' : '🌾'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-black text-sm">
                        Frete {freight.cargoType === 'livestock' ? 'de gado' : 'de grãos'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {freight.origin?.split(',')[0]} → {freight.destination?.split(',')[0]}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Hoje
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="uber-card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Nenhum frete ainda</h3>
              <p className="text-gray-600 text-sm mb-4">
                Solicite seu primeiro frete para começar
              </p>
              <Link href="/livestock-form">
                <Button className="uber-button">
                  Solicitar frete
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
