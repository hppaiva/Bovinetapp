import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Package } from "lucide-react";
import { useLocation } from "wouter";
import logoImg from "@assets/ChatGPT Image 30 de jun. de 2025, 13_22_47_1751300800822.png";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Detectar tipo de usuário e redirecionar automaticamente
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Se for parceiro iFrete (motorista), redirecionar para dashboard de motorista
        if (user.userType === 'driver') {
          setLocation('/driver-dashboard');
          return;
        }
        // Usuários normais permanecem na tela de solicitação
      } catch (error) {
        console.error('Erro ao verificar tipo de usuário:', error);
      }
    }
  }, [setLocation]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setCurrentLocation("Localização não disponível");
          setIsGettingLocation(false);
        }
      );
    } else {
      setCurrentLocation("GPS não suportado");
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={logoImg} 
                alt="iFrete" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">iFrete</h1>
              <p className="text-xs text-gray-600">Frete inteligente</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Sair
          </Button>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-6">
        {/* GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 p-3 rounded border min-h-[50px] flex items-center justify-center">
              {currentLocation ? (
                <p className="text-xs font-mono text-gray-700">{currentLocation}</p>
              ) : (
                <p className="text-gray-500 text-sm">GPS desativado</p>
              )}
            </div>
            
            <Button 
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGettingLocation ? "Localizando..." : "Ativar GPS"}
            </Button>
          </CardContent>
        </Card>

        {/* Destino estilo Uber */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <h2 className="font-medium">Para onde vamos?</h2>
              
              {/* De onde */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">De onde</p>
                  <p className="text-sm font-medium">
                    {currentLocation ? "Localização atual" : "Definir origem"}
                  </p>
                </div>
              </div>
              
              {/* Para onde */}
              <div className="flex items-center space-x-3 p-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-green-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Para onde</p>
                  <p className="text-sm text-gray-400">Escolher destino</p>
                </div>
              </div>
            </div>

            {/* Tipos de transporte */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de transporte:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col bg-green-50 border-green-200"
                  onClick={() => setLocation("/request-transport")}
                >
                  <Truck className="w-5 h-5 mb-1 text-green-600" />
                  <span className="text-xs font-medium">Gado</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col opacity-50"
                  disabled
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Grãos</span>
                  <span className="text-xs text-gray-400">Em breve</span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col opacity-50"
                  disabled
                >
                  <Truck className="w-5 h-5 mb-1" />
                  <span className="text-xs">Suínos</span>
                  <span className="text-xs text-gray-400">Em breve</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col opacity-50"
                  disabled
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Outros</span>
                  <span className="text-xs text-gray-400">Em breve</span>
                </Button>
              </div>
            </div>

            <Button 
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={!currentLocation}
              onClick={() => setLocation("/request-transport")}
            >
              Solicitar transporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}