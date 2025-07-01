import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Calculator, MapPin } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function FreightSimple() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [freightType, setFreightType] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const PRICE_PER_KM = 3.50; // R$ 3,50 por km

  const calculateFreight = () => {
    const distanceNum = parseFloat(distance);
    if (distanceNum && distanceNum > 0) {
      const price = distanceNum * PRICE_PER_KM;
      setCalculatedPrice(price);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2A38] text-white">
      {/* Header */}
      <header className="bg-[#2A3A4A] p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={bovinetLogo} 
              alt="Bovinet Logo" 
              className="h-10 w-10 rounded-lg"
            />
            <h1 className="text-2xl font-bold text-[#4CAF50]">BOVINET</h1>
          </div>
          <div className="text-sm text-gray-300">
            Sistema de Frete Agropecuário
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2 flex items-center">
            <Truck className="mr-3" size={32} />
            Calculadora de Frete
          </h2>
          <p className="text-gray-300">
            Calcule o valor do frete baseado na distância (R$ 3,50 por km)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário de Cálculo */}
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <Calculator className="mr-2" size={20} />
                Dados do Frete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="origin" className="text-gray-300">
                  Cidade de Origem
                </Label>
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="bg-[#1E2A38] border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="destination" className="text-gray-300">
                  Cidade de Destino
                </Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Rio de Janeiro, RJ"
                  className="bg-[#1E2A38] border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="distance" className="text-gray-300">
                  Distância (km)
                </Label>
                <Input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Ex: 400"
                  className="bg-[#1E2A38] border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="freightType" className="text-gray-300">
                  Tipo de Carga
                </Label>
                <Select value={freightType} onValueChange={setFreightType}>
                  <SelectTrigger className="bg-[#1E2A38] border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A3A4A] border-gray-600">
                    <SelectItem value="bovinos">Bovinos</SelectItem>
                    <SelectItem value="suinos">Suínos</SelectItem>
                    <SelectItem value="aves">Aves</SelectItem>
                    <SelectItem value="racao">Ração</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculateFreight}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                disabled={!distance || parseFloat(distance) <= 0}
              >
                <Calculator className="mr-2" size={16} />
                Calcular Frete
              </Button>
            </CardContent>
          </Card>

          {/* Resultado do Cálculo */}
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <MapPin className="mr-2" size={20} />
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedPrice !== null ? (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-[#4CAF50] bg-opacity-20 rounded-lg border border-[#4CAF50]">
                    <div className="text-3xl font-bold text-[#4CAF50] mb-2">
                      R$ {calculatedPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">
                      Valor estimado do frete
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Distância:</span>
                      <span>{distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor por km:</span>
                      <span>R$ {PRICE_PER_KM.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-[#4CAF50]">
                        R$ {calculatedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-500 bg-opacity-20 rounded border border-blue-400">
                    <p className="text-xs text-blue-300">
                      💡 <strong>Dica:</strong> Este é um valor estimado. O preço final pode variar 
                      conforme tipo de carga, urgência e condições da estrada.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Preencha os dados acima para calcular o frete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-6 bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50]">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1">Informe a Rota</h3>
                <p>Digite as cidades de origem e destino</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1">Calcule a Distância</h3>
                <p>Informe os quilômetros entre os pontos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1">Receba o Orçamento</h3>
                <p>Valor baseado em R$ 3,50 por km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}