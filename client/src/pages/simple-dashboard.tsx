import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Search, Truck, FileText, LogOut, Menu, X } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function SimpleDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = "/";
  };

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

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
            <Link href="/marketplace" className="flex items-center space-x-2 hover:text-[#4CAF50]">
              <Search size={20} />
              <span>Marketplace</span>
            </Link>
            <Link href="/services" className="flex items-center space-x-2 hover:text-[#4CAF50]">
              <Truck size={20} />
              <span>Serviços</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 hover:text-[#4CAF50]">
              <FileText size={20} />
              <span>Perfil</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-red-400"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link href="/marketplace" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Marketplace
            </Link>
            <Link href="/services" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Serviços
            </Link>
            <Link href="/profile" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-[#1E2A38] rounded text-red-400"
            >
              Sair
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2">
            Bem-vindo, {userData.name || 'Usuário'}!
          </h2>
          <p className="text-gray-300">
            Gerencie suas atividades no mercado de gado
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/marketplace">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="mx-auto mb-3 text-[#4CAF50]" size={32} />
                <h3 className="font-bold text-white mb-2">Vender Gado</h3>
                <p className="text-sm text-gray-300">Publique seus lotes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marketplace">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Search className="mx-auto mb-3 text-[#4CAF50]" size={32} />
                <h3 className="font-bold text-white mb-2">Comprar Gado</h3>
                <p className="text-sm text-gray-300">Encontre lotes disponíveis</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Truck className="mx-auto mb-3 text-[#4CAF50]" size={32} />
                <h3 className="font-bold text-white mb-2">Frete</h3>
                <p className="text-sm text-gray-300">R$ 3,50 por KM</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="mx-auto mb-3 text-[#4CAF50]" size={32} />
                <h3 className="font-bold text-white mb-2">GTA</h3>
                <p className="text-sm text-gray-300">Emitir documentos</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#4CAF50] text-lg">Meus Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">5</div>
              <div className="text-sm text-gray-300">Ativos</div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#4CAF50] text-lg">Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-sm text-gray-300">Este mês</div>
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

          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#4CAF50] text-lg">GTAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">3</div>
              <div className="text-sm text-gray-300">Pendentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50]">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <div>
                  <p className="text-white font-medium">Lote 01 - Nelore publicado</p>
                  <p className="text-sm text-gray-400">2 horas atrás</p>
                </div>
                <span className="text-green-400 text-sm">Ativo</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <div>
                  <p className="text-white font-medium">Frete solicitado para Goiânia</p>
                  <p className="text-sm text-gray-400">1 dia atrás</p>
                </div>
                <span className="text-yellow-400 text-sm">Pendente</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white font-medium">GTA emitida</p>
                  <p className="text-sm text-gray-400">3 dias atrás</p>
                </div>
                <span className="text-green-400 text-sm">Concluído</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}