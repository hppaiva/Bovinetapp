import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { LogIn, UserPlus } from "lucide-react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function AuthSimple() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login/cadastro bem-sucedido
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#1E2A38] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={bovinetLogo} 
            alt="Bovinet Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-4xl font-bold text-[#4CAF50] mb-2">BOVINET</h1>
          <p className="text-gray-300">
            Plataforma completa para o mercado de gado
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50] text-center flex items-center justify-center">
              {isLogin ? (
                <>
                  <LogIn className="mr-2" size={20} />
                  Entrar na Conta
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={20} />
                  Criar Conta
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu nome completo"
                    className="bg-[#1E2A38] border-gray-600 text-white"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="seu@email.com"
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="bg-[#1E2A38] border-gray-600 text-white"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Sua senha"
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                {isLogin ? (
                  <>
                    <LogIn className="mr-2" size={16} />
                    Entrar
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2" size={16} />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#4CAF50] hover:text-green-400 text-sm"
              >
                {isLogin 
                  ? "Não tem conta? Cadastre-se" 
                  : "Já tem conta? Faça login"
                }
              </button>
            </div>

            {/* Demo Login */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-xs text-gray-400 text-center mb-2">
                Para teste, use qualquer email e senha
              </p>
              <Button
                type="button"
                onClick={() => window.location.href = "/"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Entrar como Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-[#4CAF50] mb-4">
            O que você pode fazer
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              ✓ Comprar e vender gado
            </div>
            <div>
              ✓ Calcular frete (R$ 3,50/km)
            </div>
            <div>
              ✓ Encontrar freteiros
            </div>
            <div>
              ✓ Emitir GTA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}