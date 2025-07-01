import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SimpleAuth({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      email: email || "demo@bovinet.com", 
      name: "Usuário Bovinet" 
    }));
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1E2A38' }}>
      <Card className="w-full max-w-md p-8" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#4CAF50' }}>BOVINET</h1>
          <p className="text-white mt-2">Plataforma de Negociação de Gado</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3"
              style={{ backgroundColor: '#1E2A38', borderColor: '#666', color: 'white' }}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3"
              style={{ backgroundColor: '#1E2A38', borderColor: '#666', color: 'white' }}
            />
          </div>
          <Button 
            type="submit"
            className="w-full p-3"
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
          >
            Entrar
          </Button>
        </form>
        
        <Button 
          onClick={() => handleLogin({ preventDefault: () => {} } as any)}
          variant="outline"
          className="w-full mt-3"
          style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
        >
          Entrar como Demo
        </Button>
      </Card>
    </div>
  );
}

function SimpleDashboard({ onLogout }: { onLogout: () => void }) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  if (currentPage === "marketplace") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#1E2A38', color: 'white' }}>
        <header className="p-4" style={{ backgroundColor: '#2A3A4A' }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold" style={{ color: '#4CAF50' }}>BOVINET - Marketplace</h1>
            <div className="space-x-4">
              <Button 
                onClick={() => setCurrentPage("dashboard")}
                variant="outline"
                style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
              >
                Voltar
              </Button>
              <Button onClick={onLogout} variant="outline" style={{ borderColor: 'red', color: 'red' }}>
                Sair
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4CAF50' }}>Vender Gado</h2>
              <p className="text-gray-300 mb-4">Publique seus lotes de gado para venda</p>
              <div className="space-y-3">
                <Input placeholder="Quantidade de animais" className="w-full" />
                <Input placeholder="Peso médio (kg)" className="w-full" />
                <Input placeholder="Preço por cabeça (R$)" className="w-full" />
                <Input placeholder="Localização" className="w-full" />
                <Button className="w-full" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                  Publicar Anúncio
                </Button>
              </div>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4CAF50' }}>Comprar Gado</h2>
              <p className="text-gray-300 mb-4">Encontre lotes disponíveis</p>
              <div className="space-y-4">
                <div className="border rounded p-4" style={{ borderColor: '#666' }}>
                  <h3 className="font-bold text-white">Lote 01 - Nelore</h3>
                  <p className="text-gray-300">50 cabeças • Peso: 400kg • R$ 2.500/cabeça</p>
                  <p className="text-sm text-gray-400">Goiânia, GO</p>
                  <Button className="mt-2" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    WhatsApp
                  </Button>
                </div>
                <div className="border rounded p-4" style={{ borderColor: '#666' }}>
                  <h3 className="font-bold text-white">Lote 02 - Angus</h3>
                  <p className="text-gray-300">30 cabeças • Peso: 350kg • R$ 3.200/cabeça</p>
                  <p className="text-sm text-gray-400">Campo Grande, MS</p>
                  <Button className="mt-2" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "services") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#1E2A38', color: 'white' }}>
        <header className="p-4" style={{ backgroundColor: '#2A3A4A' }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold" style={{ color: '#4CAF50' }}>BOVINET - Serviços</h1>
            <div className="space-x-4">
              <Button 
                onClick={() => setCurrentPage("dashboard")}
                variant="outline"
                style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
              >
                Voltar
              </Button>
              <Button onClick={onLogout} variant="outline" style={{ borderColor: 'red', color: 'red' }}>
                Sair
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4CAF50' }}>Calcular Frete</h2>
              <p className="text-gray-300 mb-4">R$ 3,50 por quilômetro</p>
              <div className="space-y-3">
                <Input placeholder="Distância (km)" type="number" className="w-full" />
                <div className="text-center p-4 border rounded" style={{ borderColor: '#4CAF50' }}>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>R$ 0,00</p>
                  <p className="text-sm text-gray-300">Valor do frete</p>
                </div>
                <Button className="w-full" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                  Calcular
                </Button>
              </div>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4CAF50' }}>Emitir GTA</h2>
              <p className="text-gray-300 mb-4">Guia de Trânsito Animal</p>
              <div className="space-y-3">
                <Input placeholder="Origem" className="w-full" />
                <Input placeholder="Destino" className="w-full" />
                <Input placeholder="Quantidade de animais" className="w-full" />
                <Button className="w-full" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                  Solicitar GTA
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1E2A38', color: 'white' }}>
      <header className="p-4" style={{ backgroundColor: '#2A3A4A' }}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold" style={{ color: '#4CAF50' }}>BOVINET</h1>
          <Button onClick={onLogout} variant="outline" style={{ borderColor: 'red', color: 'red' }}>
            Sair
          </Button>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#4CAF50' }}>
            Bem-vindo, {userData.name || 'Usuário'}!
          </h2>
          <p className="text-gray-300">Gerencie suas atividades no mercado de gado</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="p-6 cursor-pointer hover:scale-105 transition-transform" 
            style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}
            onClick={() => setCurrentPage("marketplace")}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: '#4CAF50' }}>Marketplace</h3>
            <p className="text-gray-300">Comprar e vender gado</p>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:scale-105 transition-transform" 
            style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}
            onClick={() => setCurrentPage("services")}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: '#4CAF50' }}>Serviços</h3>
            <p className="text-gray-300">Frete e GTA</p>
          </Card>

          <Card className="p-6" style={{ backgroundColor: '#2A3A4A', borderColor: '#4CAF50' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#4CAF50' }}>Perfil</h3>
            <p className="text-gray-300">Suas informações</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4" style={{ backgroundColor: '#2A3A4A', borderColor: '#666' }}>
            <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>5</div>
            <div className="text-sm text-gray-300">Anúncios Ativos</div>
          </Card>
          <Card className="p-4" style={{ backgroundColor: '#2A3A4A', borderColor: '#666' }}>
            <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>12</div>
            <div className="text-sm text-gray-300">Vendas</div>
          </Card>
          <Card className="p-4" style={{ backgroundColor: '#2A3A4A', borderColor: '#666' }}>
            <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>8</div>
            <div className="text-sm text-gray-300">Fretes</div>
          </Card>
          <Card className="p-4" style={{ backgroundColor: '#2A3A4A', borderColor: '#666' }}>
            <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>R$ 3,50</div>
            <div className="text-sm text-gray-300">Por KM</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AppWorking() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('user');
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <SimpleAuth onLogin={handleLogin} />;
  }

  return <SimpleDashboard onLogout={handleLogout} />;
}