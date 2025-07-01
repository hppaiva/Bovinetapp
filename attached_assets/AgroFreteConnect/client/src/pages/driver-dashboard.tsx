import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Menu, 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  Phone,
  Navigation,
  Star,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";

export default function DriverDashboard() {
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(false);
  const [showAvailableRides, setShowAvailableRides] = useState(true);

  // Mock data para demonstração
  const driverStats = {
    rating: 4.8,
    totalTrips: 127,
    earnings: 8450.50
  };

  const availableRides = [
    {
      id: 1,
      pickup: "Fazenda Santa Clara",
      destination: "Frigorífico São João",
      distance: "85 km",
      duration: "1h 20min",
      animalCount: 15,
      estimatedEarning: 425.00,
      urgency: "normal"
    },
    {
      id: 2,
      pickup: "Fazenda Boa Vista",
      destination: "Leilão Rural Campinas", 
      distance: "120 km",
      duration: "1h 45min",
      animalCount: 22,
      estimatedEarning: 680.00,
      urgency: "urgent"
    },
    {
      id: 3,
      pickup: "Sítio Verde Vale",
      destination: "Fazenda Esperança",
      distance: "45 km", 
      duration: "55min",
      animalCount: 8,
      estimatedEarning: 285.00,
      urgency: "normal"
    }
  ];

  const handleAcceptRide = (rideId: number) => {
    // Simular aceitar corrida e ir para tela de tracking
    setLocation("/driver-tracking");
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    setShowAvailableRides(false);
  };

  const handleGoOnline = () => {
    setIsOnline(true);
    setShowAvailableRides(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-sm mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Parceiro iFrete</h1>
                <p className="text-sm text-gray-600">Motorista</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/login")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-6">
        {/* Status Online/Offline */}
        <Card className={`${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="font-medium">
                    {isOnline ? 'Você está online' : 'Você está offline'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isOnline ? 'Recebendo solicitações' : 'Não recebendo solicitações'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleGoOnline();
                  } else {
                    handleGoOffline();
                  }
                }}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas do Motorista */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-bold text-lg">{driverStats.rating}</span>
              </div>
              <p className="text-xs text-gray-600">Avaliação</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-blue-600">{driverStats.totalTrips}</div>
              <p className="text-xs text-gray-600">Viagens</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-green-600">
                R$ {driverStats.earnings.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-gray-600">Ganhos</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        {!isOnline && (
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Pronto para trabalhar?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fique online para receber solicitações de transporte de gado
              </p>
              <Button 
                onClick={handleGoOnline}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Ficar Online
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Solicitações Disponíveis */}
        {showAvailableRides && isOnline && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Solicitações Disponíveis</h2>
              <Badge variant="secondary">{availableRides.length}</Badge>
            </div>

            <div className="space-y-3">
              {availableRides.map((ride) => (
                <Card key={ride.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    {/* Urgência */}
                    {ride.urgency === "urgent" && (
                      <Badge className="bg-red-500 text-white mb-3">🔥 Urgente</Badge>
                    )}
                    
                    {/* Rota */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-sm">{ride.pickup}</span>
                      </div>
                      <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-3"></div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 border-2 border-red-500 rounded-full mr-3"></div>
                        <span className="font-medium text-sm">{ride.destination}</span>
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center">
                        <Navigation className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{ride.distance}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{ride.duration}</span>
                      </div>
                    </div>

                    {/* Gado e Valor */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🐄</span>
                        <span className="font-medium">{ride.animalCount} cabeças</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-bold text-lg">
                            R$ {ride.estimatedEarning.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Ganho estimado</p>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {}}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptRide(ride.id)}
                      >
                        Aceitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado sem solicitações */}
        {isOnline && availableRides.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Procurando solicitações...</h3>
              <p className="text-sm text-gray-600">
                Fique atento! Novas solicitações de transporte aparecerão aqui
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botão de Emergência */}
        {isOnline && (
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <Phone className="w-4 h-4 mr-2" />
            Emergência - (11) 9999-9999
          </Button>
        )}
      </div>
    </div>
  );
}