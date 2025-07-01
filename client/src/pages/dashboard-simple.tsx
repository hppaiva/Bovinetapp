import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, ShoppingCart, Truck, User, Menu } from "lucide-react";
import { useState } from "react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function DashboardSimple() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-[#4CAF50] hover:text-green-400">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-2 hover:text-green-400">
              <ShoppingCart size={20} />
              <span>Marketplace</span>
            </Link>
            <Link href="/services" className="flex items-center space-x-2 hover:text-green-400">
              <Truck size={20} />
              <span>Serviços</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 hover:text-green-400">
              <User size={20} />
              <span>Perfil</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-[#4CAF50] hover:bg-[#1E2A38] rounded">
              Dashboard
            </Link>
            <Link href="/marketplace" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Marketplace
            </Link>
            <Link href="/services" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Serviços
            </Link>
            <Link href="/profile" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Perfil
            </Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2">
            Bem-vindo ao Bovinet
          </h2>
          <p className="text-gray-300">
            Sua plataforma completa para o mercado de gado
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Marketplace Card */}
          <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <ShoppingCart className="mr-2" size={24} />
                Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Compre e venda bovinos com segurança
              </p>
              <Link href="/marketplace">
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  Acessar Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <Truck className="mr-2" size={24} />
                Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Frete, GTA e outros serviços
              </p>
              <Link href="/services">
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  Ver Serviços
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center">
                <User className="mr-2" size={24} />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Gerencie suas informações
              </p>
              <Link href="/profile">
                <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">150+</div>
              <div className="text-sm text-gray-300">Anúncios Ativos</div>
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
              <div className="text-2xl font-bold text-[#4CAF50] mb-1">200+</div>
              <div className="text-sm text-gray-300">Usuários</div>
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