import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, Truck, FileText, User } from "lucide-react";

export default function TestSimple() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer"
              onClick={() => setActiveSection("marketplace")}>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto mb-3 text-[#4CAF50]" size={32} />
            <h3 className="font-bold text-white mb-2">Marketplace</h3>
            <p className="text-sm text-gray-300">Comprar e vender</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer"
              onClick={() => setActiveSection("freight")}>
          <CardContent className="p-6 text-center">
            <Truck className="mx-auto mb-3 text-[#4CAF50]" size={32} />
            <h3 className="font-bold text-white mb-2">Frete</h3>
            <p className="text-sm text-gray-300">Solicitar transporte</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer"
              onClick={() => setActiveSection("gta")}>
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto mb-3 text-[#4CAF50]" size={32} />
            <h3 className="font-bold text-white mb-2">GTA</h3>
            <p className="text-sm text-gray-300">Emitir documentos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer"
              onClick={() => setActiveSection("profile")}>
          <CardContent className="p-6 text-center">
            <User className="mx-auto mb-3 text-[#4CAF50]" size={32} />
            <h3 className="font-bold text-white mb-2">Perfil</h3>
            <p className="text-sm text-gray-300">Minha conta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#4CAF50] text-lg">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">R$ 45.2K</div>
            <div className="text-sm text-gray-300">Este mês</div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#4CAF50] text-lg">Animais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">234</div>
            <div className="text-sm text-gray-300">Cadastrados</div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#4CAF50] text-lg">Fretes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">8</div>
            <div className="text-sm text-gray-300">Solicitados</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMarketplace = () => (
    <Tabs defaultValue="buy" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#2A3A4A]">
        <TabsTrigger value="buy" className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white">
          <Search className="w-4 h-4 mr-2" />
          Comprar
        </TabsTrigger>
        <TabsTrigger value="sell" className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Vender
        </TabsTrigger>
      </TabsList>

      <TabsContent value="buy" className="space-y-6">
        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Buscar Gado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Card className="bg-[#1F2937] border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">Lote 01 - Nelore</h3>
                      <p className="text-sm text-gray-300">50 cabeças • Machos • 18-24 meses</p>
                      <p className="text-sm text-gray-300">São Paulo, SP</p>
                    </div>
                    <Badge className="bg-[#4CAF50] text-white">R$ 2.500/cabeça</Badge>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 mt-2">
                    WhatsApp
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#1F2937] border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">Lote 02 - Angus</h3>
                      <p className="text-sm text-gray-300">30 cabeças • Fêmeas • 12-18 meses</p>
                      <p className="text-sm text-gray-300">Goiás, GO</p>
                    </div>
                    <Badge className="bg-[#4CAF50] text-white">R$ 3.200/cabeça</Badge>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 mt-2">
                    WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sell" className="space-y-6">
        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Publicar Anúncio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">Formulário para publicar gado disponível aqui.</p>
            <Button className="w-full bg-[#4CAF50] hover:bg-green-600">
              Publicar Anúncio
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderFreight = () => (
    <Card className="bg-[#2A3A4A] border-gray-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Serviços de Frete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1F2937] border-gray-600">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 text-[#4CAF50] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Solicitar Frete</h3>
              <p className="text-gray-300 mb-4">Encontre transportadores para seu gado</p>
              <Button className="w-full bg-[#4CAF50] hover:bg-green-600">
                Solicitar Agora
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1F2937] border-gray-600">
            <CardContent className="p-6 text-center">
              <Truck className="h-12 w-12 text-[#4CAF50] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Ser Transportador</h3>
              <p className="text-gray-300 mb-4">Cadastre-se como caminhoneiro</p>
              <Button className="w-full bg-[#4CAF50] hover:bg-green-600">
                Cadastrar
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderGTA = () => (
    <Card className="bg-[#2A3A4A] border-gray-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Emissão de GTA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          Solicite a emissão da Guia de Trânsito Animal para transporte legal do seu gado.
        </p>
        <Button className="w-full bg-red-600 hover:bg-red-700">
          Solicitar GTA
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Header */}
      <header className="bg-[#1F2937] border-b border-gray-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setActiveSection("dashboard")}
            >
              <div className="text-2xl font-bold text-[#4CAF50]">Bovinet</div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-gray-700"
                onClick={() => setActiveSection("profile")}
              >
                <User size={20} />
                <span className="ml-2">João Silva</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex space-x-4">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              className={activeSection === "dashboard" ? "bg-[#4CAF50] text-white" : "text-gray-300 hover:text-white"}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeSection === "marketplace" ? "default" : "ghost"}
              className={activeSection === "marketplace" ? "bg-[#4CAF50] text-white" : "text-gray-300 hover:text-white"}
              onClick={() => setActiveSection("marketplace")}
            >
              Marketplace
            </Button>
            <Button
              variant={activeSection === "freight" ? "default" : "ghost"}
              className={activeSection === "freight" ? "bg-[#4CAF50] text-white" : "text-gray-300 hover:text-white"}
              onClick={() => setActiveSection("freight")}
            >
              Frete
            </Button>
            <Button
              variant={activeSection === "gta" ? "default" : "ghost"}
              className={activeSection === "gta" ? "bg-[#4CAF50] text-white" : "text-gray-300 hover:text-white"}
              onClick={() => setActiveSection("gta")}
            >
              GTA
            </Button>
          </nav>
        </div>

        {/* Content */}
        {activeSection === "dashboard" && renderDashboard()}
        {activeSection === "marketplace" && renderMarketplace()}
        {activeSection === "freight" && renderFreight()}
        {activeSection === "gta" && renderGTA()}
        {activeSection === "profile" && (
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Configurações do perfil em desenvolvimento.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}