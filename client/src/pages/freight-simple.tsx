import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { Search, Truck } from "lucide-react";

export default function FreightSimple() {
  const [activeTab, setActiveTab] = useState("search");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[hsl(212,38%,23%)]">
      <Header />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Serviços de Frete</h1>
            <p className="text-gray-300">Encontre ou ofereça serviços de transporte</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[hsl(217,28%,31%)]">
              <TabsTrigger 
                value="search"
                className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Frete
              </TabsTrigger>
              <TabsTrigger 
                value="offer"
                className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
              >
                <Truck className="w-4 h-4 mr-2" />
                Oferecer Frete
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="mt-6">
              <Card className="bg-[hsl(217,28%,31%)] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Solicitar Transporte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    Encontre caminhoneiros para transportar seus animais
                  </p>
                  <Button 
                    onClick={() => setLocation("/request-freight")}
                    className="w-full bg-[hsl(141,64%,58%)] hover:bg-[hsl(141,64%,48%)]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Frete
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="offer" className="mt-6">
              <Card className="bg-[hsl(217,28%,31%)] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Dashboard do Caminhoneiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    Gerencie seus fretes e encontre novas oportunidades
                  </p>
                  <Button 
                    onClick={() => setLocation("/driver-dashboard")}
                    className="w-full bg-[hsl(141,64%,58%)] hover:bg-[hsl(141,64%,48%)]"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Dashboard do Caminhoneiro
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}