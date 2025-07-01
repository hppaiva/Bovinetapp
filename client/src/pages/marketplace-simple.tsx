import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Home, Search, Filter, Eye } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function MarketplaceSimple() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados de exemplo
  const listings = [
    {
      id: 1,
      title: "Lote 01 - Nelore",
      animals: 50,
      sex: "Fêmeas",
      age: "2-3 anos",
      weight: "350-400kg",
      price: "R$ 2.500/cabeça",
      location: "Goiânia, GO",
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: "Lote 02 - Angus",
      animals: 30,
      sex: "Machos",
      age: "1-2 anos",
      weight: "280-320kg", 
      price: "R$ 3.200/cabeça",
      location: "Campo Grande, MS",
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: "Lote 03 - Brahman",
      animals: 80,
      sex: "Misto",
      age: "2-4 anos",
      weight: "400-450kg",
      price: "R$ 2.800/cabeça",
      location: "Uberlândia, MG",
      image: "/api/placeholder/300/200"
    }
  ];

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Marketplace de Bovinos
          </h2>
          <p className="text-gray-300">
            Encontre os melhores lotes de gado
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por lote ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2A3A4A] border-gray-600 text-white"
            />
          </div>
          <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
            <Filter className="mr-2" size={16} />
            Filtros
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors">
              <CardHeader className="pb-2">
                <div className="aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-400">Foto do Lote</span>
                </div>
                <CardTitle className="text-[#4CAF50] text-lg">
                  {listing.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Animais:</span>
                    <span className="text-white">{listing.animals} cabeças</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sexo:</span>
                    <span className="text-white">{listing.sex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Idade:</span>
                    <span className="text-white">{listing.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Peso:</span>
                    <span className="text-white">{listing.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Localização:</span>
                    <span className="text-white">{listing.location}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="text-2xl font-bold text-[#4CAF50] mb-3">
                    {listing.price}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                      size="sm"
                    >
                      <Eye className="mr-1" size={14} />
                      Ver Detalhes
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                      size="sm"
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Nenhum lote encontrado
            </div>
            <Button 
              onClick={() => setSearchTerm("")}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              Limpar Busca
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">
                {listings.length}
              </div>
              <div className="text-sm text-gray-300">Lotes Disponíveis</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">
                {listings.reduce((sum, l) => sum + l.animals, 0)}
              </div>
              <div className="text-sm text-gray-300">Total de Animais</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">R$ 3,50</div>
              <div className="text-sm text-gray-300">Frete por KM</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}