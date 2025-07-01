import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Home, User, Edit, Save } from "lucide-react";
import { useState } from "react";
import bovinetLogo from "@assets/logo_1750855451070.png";

export default function ProfileSimple() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "João Silva",
    email: "joao@fazenda.com.br",
    phone: "(62) 99999-9999",
    city: "Goiânia",
    state: "GO",
    userType: "Produtor"
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aqui salvaria os dados
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

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#4CAF50] mb-2 flex items-center">
            <User className="mr-3" size={32} />
            Meu Perfil
          </h2>
          <p className="text-gray-300">
            Gerencie suas informações pessoais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardHeader>
              <CardTitle className="text-[#4CAF50] flex items-center justify-between">
                <span>Informações Pessoais</span>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                >
                  {isEditing ? <Save size={16} /> : <Edit size={16} />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="bg-[#1E2A38] border-gray-600 text-white"
                  />
                ) : (
                  <div className="py-2 text-white">{profile.name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="bg-[#1E2A38] border-gray-600 text-white"
                  />
                ) : (
                  <div className="py-2 text-white">{profile.email}</div>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="bg-[#1E2A38] border-gray-600 text-white"
                  />
                ) : (
                  <div className="py-2 text-white">{profile.phone}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-300">Cidade</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      className="bg-[#1E2A38] border-gray-600 text-white"
                    />
                  ) : (
                    <div className="py-2 text-white">{profile.city}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-300">Estado</Label>
                  {isEditing ? (
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => setProfile({...profile, state: e.target.value})}
                      className="bg-[#1E2A38] border-gray-600 text-white"
                    />
                  ) : (
                    <div className="py-2 text-white">{profile.state}</div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Tipo de Usuário</Label>
                <div className="py-2 text-white">{profile.userType}</div>
              </div>

              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  <Save className="mr-2" size={16} />
                  Salvar Alterações
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="space-y-6">
            <Card className="bg-[#2A3A4A] border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#4CAF50]">Suas Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Anúncios Publicados:</span>
                    <span className="text-[#4CAF50] font-semibold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Animais Vendidos:</span>
                    <span className="text-[#4CAF50] font-semibold">120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Fretes Contratados:</span>
                    <span className="text-[#4CAF50] font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">GTAs Emitidas:</span>
                    <span className="text-[#4CAF50] font-semibold">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2A3A4A] border-gray-600">
              <CardHeader>
                <CardTitle className="text-[#4CAF50]">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace">
                  <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white justify-start">
                    Publicar Anúncio
                  </Button>
                </Link>
                <Link href="/services">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                    Calcular Frete
                  </Button>
                </Link>
                <Link href="/services">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start">
                    Solicitar GTA
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configurações da Conta */}
        <Card className="mt-8 bg-[#2A3A4A] border-gray-600">
          <CardHeader>
            <CardTitle className="text-[#4CAF50]">Configurações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
              >
                Alterar Senha
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                Configurações
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}