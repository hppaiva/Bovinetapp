import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/loading-spinner";
import { formatCurrency } from "@/lib/utils";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp text-white p-4 flex items-center">
        <Link href="/producer-dashboard">
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Confirmar Solicitação</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Success Animation */}
        <div className="text-center mb-6">
          <div className="bg-whatsapp rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Frete Solicitado!</h3>
          <p className="text-gray-600">O freteiro foi notificado via WhatsApp</p>
        </div>
        
        {/* Driver Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Informações do Freteiro</h4>
            <div className="flex items-center mb-4">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mr-4">
                <i className="fas fa-user text-gray-600 text-xl"></i>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800">{booking.driver?.user?.name}</h5>
                <p className="text-gray-600 text-sm">{booking.driver?.user?.phone}</p>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400 text-xs mr-2">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas ${i < Math.floor(parseFloat(booking.driver?.rating || '0')) ? 'fa-star' : 'far fa-star'}`}></i>
                    ))}
                  </div>
                  <span className="text-gray-600 text-xs">{booking.driver?.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Veículo:</span>
                  <p className="font-medium">{booking.driver?.truckType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Placa:</span>
                  <p className="font-medium">{booking.driver?.plateNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Valor:</span>
                  <p className="font-medium text-whatsapp">
                    {formatCurrency(parseFloat(booking.driver?.pricePerKm || '0') * parseFloat(booking.freight?.distance || '0'))}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Chegada:</span>
                  <p className="font-medium">45 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* WhatsApp Notification */}
        <Card className="bg-green-50 border-green-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start">
              <i className="fab fa-whatsapp text-green-600 text-xl mr-3 mt-1"></i>
              <div>
                <h5 className="font-semibold text-green-800 mb-1">Notificação Enviada</h5>
                <p className="text-green-700 text-sm mb-2">{booking.driver?.user?.name} foi notificado via WhatsApp com os detalhes:</p>
                <div className="bg-white border rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1">🚨 Novo frete disponível:</p>
                  <p><strong>Origem:</strong> {booking.freight?.origin.split(',')[0]}</p>
                  <p><strong>Destino:</strong> {booking.freight?.destination.split(',')[0]}</p>
                  <p><strong>Tipo:</strong> {booking.freight?.cargoType === 'livestock' ? 'Carga viva' : 'Grãos'} - {booking.freight?.quantity} {booking.freight?.cargoType === 'livestock' ? booking.freight?.animalType : 'ton'}</p>
                  <p><strong>Estimado:</strong> {formatCurrency(parseFloat(booking.driver?.pricePerKm || '0') * parseFloat(booking.freight?.distance || '0'))}</p>
                  <Button size="sm" className="bg-whatsapp text-white px-3 py-1 rounded mt-2 text-xs hover:bg-whatsapp-dark">
                    Aceitar Frete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => setLocation(`/tracking-screen/${bookingId}`)}
            className="w-full bg-whatsapp text-white font-semibold py-4 rounded-xl hover:bg-whatsapp-dark transition-colors"
          >
            <i className="fas fa-map-marker-alt mr-2"></i>
            Acompanhar Frete
          </Button>
          
          <Link href="/producer-dashboard">
            <Button variant="outline" className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
