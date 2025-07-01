import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Star, MapPin, Clock, Truck } from "lucide-react";

export default function Tracking() {
  const [status, setStatus] = useState<"searching" | "found" | "arriving" | "pickup" | "transport" | "delivered">("searching");
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutos

  useEffect(() => {
    // Simular progressão do status
    const timer = setTimeout(() => {
      if (status === "searching") setStatus("found");
      else if (status === "found") setStatus("arriving");
      else if (status === "arriving") setStatus("pickup");
      else if (status === "pickup") setStatus("transport");
    }, 3000);

    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    // Countdown timer
    if (timeRemaining > 0 && status === "arriving") {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, status]);

  const getStatusText = () => {
    switch (status) {
      case "searching": return "Procurando motorista...";
      case "found": return "Motorista encontrado";
      case "arriving": return "Motorista a caminho";
      case "pickup": return "Carregando animais";
      case "transport": return "Em transporte";
      case "delivered": return "Entregue";
      default: return "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mapa simulado */}
      <div className="bg-gray-200 h-80 relative flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p>Mapa em tempo real</p>
          <p className="text-sm">Acompanhe a localização do motorista</p>
        </div>
        
        {/* Indicador de status */}
        <div className="absolute top-4 left-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-4">
        {/* Status principal */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">{getStatusText()}</h2>
              {status === "arriving" && (
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatTime(timeRemaining)}</p>
                  <p className="text-sm text-gray-500">Tempo estimado de chegada</p>
                </div>
              )}
              {status === "searching" && (
                <p className="text-sm text-gray-500">Encontrando o melhor motorista para você</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do motorista */}
        {status !== "searching" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">👨‍🌾</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">João Silva</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>4.9</span>
                    <span>•</span>
                    <span>248 viagens</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do veículo */}
        {status !== "searching" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Ford Cargo 2428</p>
                  <p className="text-sm text-gray-500">Placa: ABC-1234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhes da viagem */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium">Detalhes da viagem</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Origem</span>
                <span>Fazenda São João</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destino</span>
                <span>Frigorífico Central</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo</span>
                <span>Gado Bovino</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantidade</span>
                <span>25 animais</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Distância</span>
                <span>45 km</span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>R$ 126,00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de ação */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = "/"}
        >
          {status === "delivered" ? "Nova viagem" : "Cancelar viagem"}
        </Button>
      </div>
    </div>
  );
}