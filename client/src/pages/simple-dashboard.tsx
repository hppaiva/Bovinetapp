import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, Search, LogOut, Menu, X, User } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function SimpleDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = "/";
  };

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-[#1E2A38] text-white pb-20">
      {/* Header */}
      <header className="bg-[#2A3A4A] p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={bovinetLogo} 
              alt="Bovinet Logo" 
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#4CAF50]">BOVINET</h1>
              <p className="text-xs text-gray-400">Marketplace do Gado</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/marketplace" className="flex items-center space-x-2 hover:text-[#4CAF50] transition-colors">
              <Search size={20} />
              <span>Marketplace</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 hover:text-[#4CAF50] transition-colors">
              <User size={20} />
              <span>Perfil</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors"
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
              🛒 Marketplace
            </Link>
            <Link href="/profile" className="block px-4 py-2 hover:bg-[#1E2A38] rounded">
              👤 Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-[#1E2A38] rounded text-red-400"
            >
              🚪 Sair
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2">
            Bem-vindo, {userData.name || 'Usuário'}! 👋
          </h2>
          <p className="text-gray-300">
            Compre e venda gado com segurança no Bovinet
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Link href="/marketplace?tab=sell">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-all cursor-pointer hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-3">🐄</div>
                <h3 className="font-bold text-white mb-2 text-lg">Vender Gado</h3>
                <p className="text-sm text-gray-300">Publique seus lotes e alcance compradores em todo Brasil</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marketplace?tab=buy">
            <Card className="bg-[#2A3A4A] border-gray-600 hover:border-[#4CAF50] transition-all cursor-pointer hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="font-bold text-white mb-2 text-lg">Comprar Gado</h3>
                <p className="text-sm text-gray-300">Encontre lotes disponíveis perto de você</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#4CAF50] text-lg">Meus Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">5</div>
              <div className="text-sm text-gray-300">Ativos no marketplace</div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#4CAF50] text-lg">Negociações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-sm text-gray-300">Este mês</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50]">📋 Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <div>
                  <p className="text-white font-medium">🐄 Lote 01 - Nelore publicado</p>
                  <p className="text-sm text-gray-400">2 horas atrás</p>
                </div>
                <span className="text-green-400 text-sm font-semibold">Ativo</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <div>
                  <p className="text-white font-medium">💬 Contato recebido pelo WhatsApp</p>
                  <p className="text-sm text-gray-400">1 dia atrás</p>
                </div>
                <span className="text-yellow-400 text-sm font-semibold">Pendente</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white font-medium">✅ Venda de Lote 03 concluída</p>
                  <p className="text-sm text-gray-400">3 dias atrás</p>
                </div>
                <span className="text-green-400 text-sm font-semibold">Concluído</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
