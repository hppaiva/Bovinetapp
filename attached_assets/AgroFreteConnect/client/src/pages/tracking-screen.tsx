import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function TrackingScreen() {
  const { bookingId } = useParams();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    enabled: !!bookingId,
  });

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Agendamento não encontrado</p>
      </div>
    );
  }

  const trackingSteps = [
    { 
      id: 1, 
      title: "Frete Solicitado", 
      time: "Hoje às 14:30", 
      completed: true,
      icon: "fa-check"
    },
    { 
      id: 2, 
      title: "Frete Aceito", 
      time: "Hoje às 14:35", 
      completed: true,
      icon: "fa-check"
    },
    { 
      id: 3, 
      title: "A Caminho da Origem", 
      time: "Chegada em 42 minutos", 
      completed: false,
      current: true,
      icon: "fa-truck"
    },
    { 
      id: 4, 
      title: "Carregamento", 
      time: "Aguardando", 
      completed: false,
      icon: "fa-box-open"
    },
    { 
      id: 5, 
      title: "Entrega", 
      time: "Aguardando", 
      completed: false,
      icon: "fa-flag-checkered"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp text-white p-4 flex items-center">
        <Link href={`/booking-confirmation/${bookingId}`}>
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Acompanhar Frete</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Status */}
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Frete Aceito!</h3>
                <p className="text-blue-600 text-sm">{booking.driver?.user?.name} está a caminho da sua propriedade</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <i className="fas fa-truck text-blue-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Map Placeholder */}
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="bg-gray-200 h-64 flex items-center justify-center border border-gray-300 rounded-lg">
              <div className="text-center text-gray-600">
                <i className="fas fa-map text-4xl mb-2"></i>
                <p className="text-sm">Mapa em Tempo Real</p>
                <p className="text-xs">Localização do freteiro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress Timeline */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Progresso do Frete</h4>
            
            <div className="space-y-4">
              {trackingSteps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`rounded-full p-2 mr-4 ${
                    step.completed 
                      ? 'bg-whatsapp' 
                      : step.current 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-gray-300'
                  }`}>
                    <i className={`fas ${step.icon} text-white text-sm`}></i>
                  </div>
                  <div className={step.completed || step.current ? '' : 'opacity-50'}>
                    <p className="font-medium text-gray-800">{step.title}</p>
                    <p className={`text-sm ${
                      step.completed 
                        ? 'text-gray-500' 
                        : step.current 
                          ? 'text-blue-500' 
                          : 'text-gray-400'
                    }`}>
                      {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Driver Contact */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Contato</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">{booking.driver?.user?.name}</h5>
                  <p className="text-gray-600 text-sm">{booking.driver?.user?.phone}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-whatsapp text-white p-3 rounded-full hover:bg-whatsapp-dark transition-colors">
                  <i className="fab fa-whatsapp"></i>
                </Button>
                <Button size="sm" className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                  <i className="fas fa-phone"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
