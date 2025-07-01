import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Navigation, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";

export default function DriverTracking() {
  const [, setLocation] = useLocation();
  const [tripStatus, setTripStatus] = useState<"going_to_pickup" | "loading" | "in_transit" | "unloading" | "completed">("going_to_pickup");

  // Mock data para demonstração
  const currentTrip = {
    id: 1,
    pickup: "Fazenda Santa Clara",
    pickupAddress: "Rod. SP-215, km 47 - Araraquara, SP",
    destination: "Frigorífico São João", 
    destinationAddress: "Av. Industrial, 890 - São Carlos, SP",
    distance: "85 km",
    animalCount: 15,
    producerName: "João Silva",
    producerPhone: "(16) 99876-5432",
    earning: 425.00,
    estimatedTime: "1h 20min",
    startTime: "14:30",
    currentTime: "15:45"
  };

  const getStatusInfo = () => {
    switch (tripStatus) {
      case "going_to_pickup":
        return {
          title: "Indo para coleta",
          description: "Dirigindo para a fazenda",
          color: "bg-blue-500",
          nextAction: "Confirmar chegada"
        };
      case "loading":
        return {
          title: "Carregando",
          description: "Embarcando o gado",
          color: "bg-orange-500", 
          nextAction: "Iniciar viagem"
        };
      case "in_transit":
        return {
          title: "Em trânsito",
          description: "Transportando para destino",
          color: "bg-green-500",
          nextAction: "Confirmar chegada"
        };
      case "unloading":
        return {
          title: "Descarregando",
          description: "Desembarcando o gado",
          color: "bg-orange-500",
          nextAction: "Finalizar viagem"
        };
      case "completed":
        return {
          title: "Viagem concluída",
          description: "Transporte finalizado",
          color: "bg-gray-500",
          nextAction: "Voltar ao dashboard"
        };
    }
  };

  const handleNextStep = () => {
    switch (tripStatus) {
      case "going_to_pickup":
        setTripStatus("loading");
        break;
      case "loading":
        setTripStatus("in_transit");
        break;
      case "in_transit":
        setTripStatus("unloading");
        break;
      case "unloading":
        setTripStatus("completed");
        break;
      case "completed":
        setLocation("/driver-dashboard");
        break;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/driver-dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-medium">Viagem em andamento</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-4">
        {/* Status da Viagem */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`}></div>
                <div>
                  <h3 className="font-medium">{statusInfo.title}</h3>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
              <Badge className="bg-green-600">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mapa Simulado */}
        <Card>
          <CardContent className="p-0">
            <div className="h-48 bg-gradient-to-b from-green-50 to-green-100 relative rounded-lg overflow-hidden">
              {/* Simulação de mapa */}
              <div className="absolute inset-0 opacity-20 bg-green-100"></div>
              
              {/* Rota simulada */}
              <div className="absolute top-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-green-300 mx-2 relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full absolute -top-2.5 left-1/3 border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs">
                  <span className="bg-white/80 px-2 py-1 rounded">Origem</span>
                  <span className="bg-white/80 px-2 py-1 rounded">Você está aqui</span>
                  <span className="bg-white/80 px-2 py-1 rounded">Destino</span>
                </div>
              </div>

              {/* Botão GPS */}
              <Button
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg"
                variant="outline"
                size="sm"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Viagem */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Detalhes da viagem</h3>
            
            {/* Rota */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{currentTrip.pickup}</p>
                  <p className="text-xs text-gray-600">{currentTrip.pickupAddress}</p>
                </div>
              </div>
              
              <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-4"></div>
              
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 border-2 border-red-500 rounded-full mt-1"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{currentTrip.destination}</p>
                  <p className="text-xs text-gray-600">{currentTrip.destinationAddress}</p>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Navigation className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{currentTrip.distance}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{currentTrip.estimatedTime}</span>
              </div>
            </div>

            {/* Gado e Ganho */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🐄</span>
                <span className="font-medium">{currentTrip.animalCount} cabeças</span>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-bold">
                    R$ {currentTrip.earning.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato do Produtor */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Contato do produtor</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentTrip.producerName}</p>
                <p className="text-sm text-gray-600">{currentTrip.producerPhone}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Ligar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ação Principal */}
        <Button
          onClick={handleNextStep}
          className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg font-medium"
          disabled={tripStatus === "completed"}
        >
          {tripStatus === "completed" ? (
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Viagem finalizada
            </div>
          ) : (
            statusInfo.nextAction
          )}
        </Button>

        {/* Botão de Emergência */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergência - (11) 9999-9999
        </Button>
      </div>
    </div>
  );
}