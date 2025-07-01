import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Plus, Minus, Clock, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

export default function RequestFreight() {
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
    setLocation("/freight?tab=list");
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
                onClick={() => setLocation("/freight")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-bold text-accent-green">Bovinet</div>
              <div></div>
            </div>
          </div>

          {/* Área do Mapa Simulado */}
          <div className="h-screen bg-gradient-to-b from-accent-green/10 to-accent-green/20 relative">
            {/* Simulação de mapa */}
            <div className="absolute inset-0 opacity-20 bg-accent-green/10"></div>
            
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
                <div className="w-3 h-3 bg-accent-green rounded-full mr-3"></div>
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

              <Button 
                onClick={handleSetDestination}
                disabled={!destination.trim()}
                className="w-full bg-accent-green hover:bg-accent-green/90 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Definir destino
              </Button>

              {/* Sugestões de destinos */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">Destinos recentes</p>
                {["Frigorífico São João", "Leilão Rural", "Fazenda Santa Clara"].map((place) => (
                  <button
                    key={place}
                    onClick={() => setDestination(place)}
                    className="flex items-center w-full p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{place}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detalhes da Viagem */}
      {step === "details" && (
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <div className="max-w-sm mx-auto p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("map")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <h1 className="text-2xl font-bold mb-6">Detalhes do Transporte</h1>

            {/* Resumo da Rota */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent-green rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">Origem</p>
                      <p className="text-sm text-gray-600">{origin}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-l-2 border-gray-200 ml-1.5 h-8"></div>
                
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-gray-400 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Destino</p>
                    <p className="text-sm text-gray-600">{destination}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantidade de Animais */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Quantidade de Animais</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Bovinos</span>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previsão */}
            {estimatedPrice > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Estimativa</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo estimado</span>
                      <span className="font-medium">{estimatedTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distância</span>
                      <span className="font-medium">{distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço por km</span>
                      <span className="font-medium">R$ 3,50</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-semibold">Total estimado</span>
                      <span className="font-bold text-lg text-accent-green">
                        R$ {estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={() => setStep("confirmation")}
              className="w-full bg-accent-green hover:bg-accent-green/90 text-white py-3 text-lg font-semibold rounded-xl"
            >
              Solicitar Transporte
            </Button>
          </div>
          
          <BottomNav />
        </div>
      )}

      {/* Confirmação */}
      {step === "confirmation" && (
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <div className="max-w-sm mx-auto p-4">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Solicitação Enviada!</h1>
              <p className="text-gray-600 mb-8">
                Estamos procurando o melhor caminhoneiro para você. 
                Você receberá cotações em breve.
              </p>

              <Card className="mb-6 text-left">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Resumo da Solicitação</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Origem:</span>
                      <span>{origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span>{destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Animais:</span>
                      <span>{quantity} bovinos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimativa:</span>
                      <span className="text-accent-green font-semibold">R$ {estimatedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleConfirmRide}
                className="w-full bg-accent-green hover:bg-accent-green/90 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Ver Minhas Solicitações
              </Button>
            </div>
          </div>
          
          <BottomNav />
        </div>
      )}
    </div>
  );
}