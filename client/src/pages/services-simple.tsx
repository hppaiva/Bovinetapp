import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Home, Truck, Calculator, FileText, MapPin } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function ServicesSimple() {
  const [distance, setDistance] = useState("");
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
          
          <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-[#4CAF50]">
            <Home size={20} />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2">
            Serviços Bovinet
          </h2>
          <p className="text-gray-300">
            Frete, GTA e outros serviços para o agronegócio
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculadora de Frete */}
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <Calculator className="mr-2" size={20} />
                Calculadora de Frete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button 
                onClick={calculateFreight}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                disabled={!distance || parseFloat(distance) <= 0}
              >
                <Calculator className="mr-2" size={16} />
                Calcular Frete
              </Button>

              {calculatedPrice !== null && (
                <div className="mt-4 p-4 bg-[#4CAF50] bg-opacity-20 rounded-lg border border-[#4CAF50]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4CAF50] mb-2">
                      R$ {calculatedPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {distance} km × R$ {PRICE_PER_KM.toFixed(2)}/km
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outros Serviços */}
          <div className="space-y-6">
            {/* Buscar Frete */}
            <Card className="bg-[#2A3A4A] border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#4CAF50] flex items-center">
                  <Truck className="mr-2" size={20} />
                  Buscar Frete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Encontre freteiros disponíveis na sua região
                </p>
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  <MapPin className="mr-2" size={16} />
                  Buscar Freteiros
                </Button>
              </CardContent>
            </Card>

            {/* Emitir GTA */}
            <Card className="bg-[#2A3A4A] border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#4CAF50] flex items-center">
                  <FileText className="mr-2" size={20} />
                  Emitir GTA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Emissão de Guia de Trânsito Animal
                </p>
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  <FileText className="mr-2" size={16} />
                  Solicitar GTA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informações sobre Frete */}
        <Card className="mt-8 bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50]">Como Funciona o Frete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1 text-white">Calcule a Distância</h3>
                <p>Informe os quilômetros entre origem e destino</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1 text-white">Valor Fixo por KM</h3>
                <p>R$ 3,50 por quilômetro rodado</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#4CAF50] font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1 text-white">Contrate o Freteiro</h3>
                <p>Encontre freteiros disponíveis na região</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">R$ 3,50</div>
              <div className="text-sm text-gray-300">Preço por KM</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">50+</div>
              <div className="text-sm text-gray-300">Freteiros</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">100+</div>
              <div className="text-sm text-gray-300">GTAs Emitidas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">24h</div>
              <div className="text-sm text-gray-300">Atendimento</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}