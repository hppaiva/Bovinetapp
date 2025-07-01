import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function BovinetHome() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login bem-sucedido
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      email: loginData.email, 
      name: "Usuário Bovinet" 
    }));
    window.location.href = "/dashboard";
  };

  const goToDashboard = () => {
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      email: "demo@bovinet.com", 
      name: "Usuário Demo" 
    }));
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1E2A38', color: '#fff' }}>
      <div className="container mx-auto px-4 py-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={bovinetLogo} 
            alt="Bovinet Logo" 
            className="w-48 h-auto mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-4xl font-bold text-white mb-2">BOVINET</h1>
          <p className="text-xl text-gray-300">
            Sua plataforma completa para o mercado de gado
          </p>
        </div>

        {!showLogin ? (
          <div className="space-y-6 max-w-md mx-auto">
            <Button 
              onClick={goToDashboard}
              className="w-full py-4 text-lg bg-white text-black hover:bg-gray-100"
            >
              Entrar no Sistema
            </Button>
            
            <Button 
              onClick={() => setShowLogin(true)}
              variant="outline"
              className="w-full py-4 text-lg border-white text-white hover:bg-white hover:text-black"
            >
              Login com Credenciais
            </Button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-bold text-green-400 mb-2">Marketplace</h3>
                  <p className="text-sm text-gray-300">Compre e venda bovinos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-bold text-green-400 mb-2">Frete</h3>
                  <p className="text-sm text-gray-300">R$ 3,50 por quilômetro</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-bold text-green-400 mb-2">GTA</h3>
                  <p className="text-sm text-gray-300">Emissão de documentos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Login no Bovinet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Entrar
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogin(false)}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p>&copy; 2025 Bovinet - Plataforma de Negociação de Gado</p>
          <p className="text-sm mt-2">Conectando produtores, compradores e freteiros</p>
        </div>
      </div>
    </div>
  );
}