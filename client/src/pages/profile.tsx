import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  TrendingUp,
  ShoppingCart,
  Truck,
  FileText,
  MapPin,
  Phone,
  ChevronRight
} from "lucide-react";

export default function Profile() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: userListings } = useQuery({
    queryKey: ["/api/listings/user"],
    enabled: !!user?.user?.id,
  });

  const { data: freightRequests } = useQuery({
    queryKey: ["/api/freight-requests", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const { data: gtaRequests } = useQuery({
    queryKey: ["/api/gta-requests", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      // Limpar cache e redirecionar
      queryClient.clear();
      window.location.href = "/login";
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao sair da conta",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      logoutMutation.mutate();
    }
  };

  const stats = {
    totalSales: userListings?.listings?.filter((l: any) => !l.isActive)?.length || 0,
    totalPurchases: 0, // This would come from a purchase history API
    totalFreights: freightRequests?.requests?.length || 0,
    totalGtas: gtaRequests?.requests?.length || 0,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        <Card className="bg-container-bg border-gray-600 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-accent-green to-blue-600 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-bg">
                  {user?.user?.name ? getInitials(user.user.name) : "U"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.user?.name || "Usuário"}
                </h2>
                <div className="flex items-center space-x-2 text-green-100">
                  <MapPin className="h-4 w-4" />
                  <span>{user?.user?.city}, {user?.user?.state}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-100 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{user?.user?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <CardContent className="p-6 space-y-6">
            {/* Account Verification Status */}
            <div className="flex items-center justify-between p-4 bg-primary-bg rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-accent-green" />
                <div>
                  <p className="font-medium text-white">Status da Conta</p>
                  <p className="text-sm text-secondary">Verificação de identidade</p>
                </div>
              </div>
              <Badge className={user?.user?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {user?.user?.isVerified ? "Verificada" : "Pendente"}
              </Badge>
            </div>

            {/* Account Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Estatísticas da Conta</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <p className="text-2xl font-bold text-accent-green">{stats.totalSales}</p>
                  <p className="text-sm text-secondary">Vendas realizadas</p>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{stats.totalPurchases}</p>
                  <p className="text-sm text-secondary">Compras realizadas</p>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalFreights}</p>
                  <p className="text-sm text-secondary">Fretes contratados</p>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{stats.totalGtas}</p>
                  <p className="text-sm text-secondary">GTAs emitidas</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Acesso Rápido</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start border-gray-600 hover:bg-primary-bg"
                  onClick={() => window.location.href = "/marketplace?tab=sell"}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-accent-green" />
                    <span className="text-white">Vender Gado</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start border-gray-600 hover:bg-primary-bg"
                  onClick={() => window.location.href = "/marketplace?tab=buy"}
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-accent-green" />
                    <span className="text-white">Comprar Gado</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start border-gray-600 hover:bg-primary-bg"
                  onClick={() => window.location.href = "/freight?tab=search"}
                >
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-accent-green" />
                    <span className="text-white">Buscar Frete</span>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 justify-start border-gray-600 hover:bg-primary-bg"
                  onClick={() => window.location.href = "/services?tab=gta"}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-accent-green" />
                    <span className="text-white">Emitir GTA</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Profile Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Configurações</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 bg-primary-bg rounded-lg hover:bg-gray-700 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-accent-green" />
                    <span>Editar Perfil</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 bg-primary-bg rounded-lg hover:bg-gray-700 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-accent-green" />
                    <span>Notificações</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 bg-primary-bg rounded-lg hover:bg-gray-700 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-accent-green" />
                    <span>Privacidade e Segurança</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 bg-primary-bg rounded-lg hover:bg-gray-700 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-accent-green" />
                    <span>Ajuda e Suporte</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary" />
                </Button>
                
                <Button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center justify-between p-3 bg-accent-red rounded-lg hover:bg-red-600 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="h-5 w-5 text-white" />
                    <span>{logoutMutation.isPending ? "Saindo..." : "Sair da Conta"}</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Atividade Recente</h3>
              <div className="space-y-3">
                {userListings?.listings?.slice(0, 3).map((listing: any) => (
                  <div key={listing.id} className="flex items-center space-x-3 p-3 bg-primary-bg rounded-lg">
                    <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{listing.title}</p>
                      <p className="text-sm text-secondary">
                        {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={listing.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {listing.isActive ? "Ativo" : "Finalizado"}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-secondary">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
