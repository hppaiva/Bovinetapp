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
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

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
    setLocation("/freight?tab=trucker");
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
                <h1 className="font-bold text-lg">Parceiro Bovinet</h1>
                <p className="text-sm text-gray-600">Caminhoneiro</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/auth")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Status Online/Offline */}
        <div className="p-4">
          <Card className={`border-2 ${isOnline ? 'border-accent-green bg-accent-green/5' : 'border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-accent-green' : 'bg-gray-400'}`}></div>
                  <div>
                    <h3 className="font-semibold">
                      {isOnline ? 'Você está Online' : 'Você está Offline'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isOnline ? 'Recebendo solicitações' : 'Toque para ficar online'}
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
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas do Motorista */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-bold">{driverStats.rating}</span>
                </div>
                <p className="text-xs text-gray-600">Avaliação</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="font-bold mb-1">{driverStats.totalTrips}</div>
                <p className="text-xs text-gray-600">Viagens</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="font-bold mb-1">R$ {driverStats.earnings.toFixed(0)}</div>
                <p className="text-xs text-gray-600">Ganhos</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Solicitações Disponíveis */}
        {isOnline && showAvailableRides && (
          <div className="px-4">
            <h2 className="text-lg font-bold mb-4">Fretes Disponíveis</h2>
            
            <div className="space-y-3">
              {availableRides.map((ride) => (
                <Card key={ride.id} className="border-l-4 border-l-accent-green">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <MapPin className="w-4 h-4 text-accent-green mr-2" />
                          <span className="font-medium text-sm">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">{ride.destination}</span>
                        </div>
                      </div>
                      {ride.urgency === "urgent" && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{ride.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Truck className="w-3 h-3 mr-1" />
                        <span>{ride.animalCount} bovinos</span>
                      </div>
                      <span>{ride.distance}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-accent-green mr-1" />
                        <span className="font-bold text-accent-green">
                          R$ {ride.estimatedEarning.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Contato
                        </Button>
                        <Button
                          onClick={() => handleAcceptRide(ride.id)}
                          size="sm"
                          className="bg-accent-green hover:bg-accent-green/90 text-xs"
                        >
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado Offline */}
        {!isOnline && (
          <div className="px-4 py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Você está offline</h3>
            <p className="text-gray-600 mb-6">
              Ative o status online para começar a receber solicitações de frete
            </p>
            <Button
              onClick={handleGoOnline}
              className="bg-accent-green hover:bg-accent-green/90"
            >
              Ficar Online
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}