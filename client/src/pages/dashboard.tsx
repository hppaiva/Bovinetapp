import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { 
  BellRing, 
  TrendingUp, 
  Truck, 
  FileText, 
  Plus, 
  Search, 
  CheckCircle,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: userListings } = useQuery({
    queryKey: ["/api/listings/user", user?.user?.id],
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

  const stats = {
    activeListings: userListings?.listings?.filter((l: any) => l.isActive)?.length || 0,
    salesThisMonth: userListings?.listings?.filter((l: any) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(l.createdAt) > monthAgo;
    })?.length || 0,
    activeFreights: freightRequests?.requests?.filter((r: any) => r.status === 'pending')?.length || 0,
    pendingGtas: gtaRequests?.requests?.filter((r: any) => r.status === 'pending')?.length || 0,
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-white">Bem-vindo de volta!</h2>
          <p className="text-secondary">Gerencie seus negócios de forma eficiente</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm">Anúncios Ativos</p>
                  <p className="text-2xl font-bold text-white">{stats.activeListings}</p>
                </div>
                <BellRing className="text-accent-green h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm">Vendas este mês</p>
                  <p className="text-2xl font-bold text-white">{stats.salesThisMonth}</p>
                </div>
                <TrendingUp className="text-accent-green h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm">Fretes Ativos</p>
                  <p className="text-2xl font-bold text-white">{stats.activeFreights}</p>
                </div>
                <Truck className="text-accent-green h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm">GTAs Pendentes</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingGtas}</p>
                </div>
                <FileText className="text-accent-red h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-white">Ações Rápidas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/marketplace?tab=sell">
              <Button className="w-full h-auto p-4 bg-accent-green hover:bg-green-600 text-white flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span className="font-semibold">Vender Gado</span>
              </Button>
            </Link>

            <Link href="/marketplace?tab=buy">
              <Button className="w-full h-auto p-4 bg-container-bg hover:bg-gray-600 text-white flex flex-col items-center space-y-2 border border-gray-600">
                <Search className="h-6 w-6" />
                <span className="font-semibold">Comprar Gado</span>
              </Button>
            </Link>

            <Link href="/freight?tab=search">
              <Button className="w-full h-auto p-4 bg-container-bg hover:bg-gray-600 text-white flex flex-col items-center space-y-2 border border-gray-600">
                <Truck className="h-6 w-6" />
                <span className="font-semibold">Buscar Frete</span>
              </Button>
            </Link>

            <Link href="/services?tab=gta">
              <Button className="w-full h-auto p-4 bg-container-bg hover:bg-gray-600 text-white flex flex-col items-center space-y-2 border border-gray-600">
                <FileText className="h-6 w-6" />
                <span className="font-semibold">Emitir GTA</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Atividade Recente</h3>
          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-4 space-y-4">
              {userListings?.listings?.slice(0, 3).map((listing: any, index: number) => (
                <div key={listing.id} className="flex items-center space-x-3 p-3 hover:bg-primary-bg rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{listing.title}</p>
                    <p className="text-sm text-secondary">
                      {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <p className="text-secondary">Nenhuma atividade recente</p>
                  <p className="text-sm text-secondary mt-2">
                    Comece criando seu primeiro anúncio ou solicitação
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
