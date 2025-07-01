import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Plus, Minus, Clock, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function RequestTransport() {
  const [, setLocation] = useLocation();
  const [origin, setOrigin] = useState("Sua localização atual");
  const [destination, setDestination] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"map" | "details" | "confirmation">("map");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Simular cálculo de preço baseado na distância
  useEffect(() => {
    if (destination && destination.length > 0) {
      const mockDistance = Math.floor(Math.random() * 200) + 50; // 50-250km
      const pricePerKm = 3.50;
      const basePrice = quantity * pricePerKm * mockDistance;
      setEstimatedPrice(basePrice);
      setEstimatedTime(Math.floor(mockDistance / 60) + 1); // Aproximadamente 1h por 60km
    }
  }, [destination, quantity]);

  const handleSetDestination = () => {
    if (destination.trim()) {
      setStep("details");
    }
  };

  const handleConfirmRide = () => {
    setLocation("/tracking");
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Mapa Simulado - Tela Principal */}
      {step === "map" && (
        <>
          {/* Header com logo */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b">
            <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-bold text-green-600">iFrete</div>
              <div></div>
            </div>
          </div>

          {/* Área do Mapa Simulado */}
          <div className="h-screen bg-gradient-to-b from-green-50 to-green-100 relative">
            {/* Simulação de mapa */}
            <div className="absolute inset-0 opacity-20 bg-green-100"></div>
            
            {/* Ponto de localização atual */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-full absolute -top-2 -left-2 animate-ping"></div>
            </div>

            {/* Botão GPS */}
            <Button
              className="absolute top-20 right-4 w-12 h-12 rounded-full bg-white shadow-lg"
              variant="outline"
              size="sm"
            >
              <Navigation className="w-5 h-5" />
            </Button>
          </div>

          {/* Card inferior - Para onde? */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
            <div className="max-w-sm mx-auto p-6">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              <h2 className="text-xl font-bold mb-6">Para onde vamos transportar?</h2>
              
              {/* Origem */}
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 flex-1">{origin}</span>
              </div>

              {/* Destino */}
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 border-2 border-gray-400 rounded-full mr-3"></div>
                <Input
                  placeholder="Digite o destino..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="flex-1 border-0 bg-gray-50 text-lg"
                />
              </div>

              {/* Botão continuar */}
              <Button
                onClick={handleSetDestination}
                disabled={!destination.trim()}
                className="w-full bg-black text-white py-4 text-lg font-medium rounded-xl"
              >
                Confirmar destino
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Tela de Detalhes do Transporte */}
      {step === "details" && (
        <div className="min-h-screen bg-white">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("map")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-medium">Detalhes do transporte</h1>
              <div></div>
            </div>
          </div>

          <div className="max-w-sm mx-auto p-6">
            {/* Resumo da rota */}
            <Card className="mb-6 border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{origin}</span>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-4"></div>
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{destination}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de transporte - Foco em bovinos */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Tipo de transporte</h3>
              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🐄</span>
                      <div>
                        <h4 className="font-medium">Gado Bovino</h4>
                        <p className="text-sm text-gray-600">Transporte especializado</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">R$ 3,50/km</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quantidade de animais */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Quantidade de bovinos</h3>
              <div className="flex items-center justify-center bg-gray-50 rounded-xl p-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="mx-8 text-3xl font-bold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Cabeças de gado
              </p>
            </div>

            {/* Informações da viagem */}
            {estimatedPrice > 0 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Tempo estimado</span>
                    </div>
                    <span className="font-bold">{estimatedTime}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Valor estimado</span>
                    </div>
                    <span className="font-bold text-xl text-blue-600">
                      R$ {estimatedPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botão confirmar */}
            <Button
              onClick={() => setStep("confirmation")}
              className="w-full bg-black text-white py-4 text-lg font-medium rounded-xl"
              disabled={!destination || quantity < 1}
            >
              Solicitar transporte
            </Button>
          </div>
        </div>
      )}

      {/* Tela de Confirmação */}
      {step === "confirmation" && (
        <div className="min-h-screen bg-white">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("details")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-medium">Confirmar solicitação</h1>
              <div></div>
            </div>
          </div>

          <div className="max-w-sm mx-auto p-6">
            {/* Resumo da solicitação */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-center">Resumo da viagem</h3>
                
                {/* Rota */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">De:</span>
                  </div>
                  <p className="font-medium ml-6">{origin}</p>
                  
                  <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-4 my-2"></div>
                  
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 border-2 border-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Para:</span>
                  </div>
                  <p className="font-medium ml-6">{destination}</p>
                </div>

                {/* Detalhes do transporte */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de carga:</span>
                    <span className="font-medium">🐄 Gado Bovino</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="font-medium">{quantity} cabeças</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo estimado:</span>
                    <span className="font-medium">{estimatedTime}h</span>
                  </div>
                </div>

                {/* Valor */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium">Valor estimado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {estimatedPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    *Valor final será confirmado pelo motorista
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botão final */}
            <Button
              onClick={handleConfirmRide}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl"
            >
              Confirmar e buscar motorista
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Você será conectado com motoristas próximos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}