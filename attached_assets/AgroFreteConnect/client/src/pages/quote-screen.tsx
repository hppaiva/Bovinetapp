import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LoadingSpinner } from "@/components/loading-spinner";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function QuoteScreen() {
  const { freightId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: freight, isLoading: freightLoading } = useQuery({
    queryKey: ['/api/freights', freightId],
    enabled: !!freightId,
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['/api/quotes/freight', freightId],
    enabled: !!freightId,
  });

  const bookingMutation = useMutation({
    mutationFn: async ({ quoteId, driverId }: { quoteId: number; driverId: number }) => {
      const response = await apiRequest('POST', '/api/bookings', {
        freightId: parseInt(freightId!),
        driverId,
        quoteId,
      });
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Frete Solicitado!",
        description: "O freteiro foi notificado via WhatsApp",
      });
      setLocation(`/booking-confirmation/${booking.id}`);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao solicitar frete. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (freightLoading || quotesLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!freight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Frete não encontrado</p>
      </div>
    );
  }

  const handleRequestFreight = (quote: any) => {
    bookingMutation.mutate({
      quoteId: quote.id,
      driverId: quote.driver.id,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp text-white p-4 flex items-center">
        <Link href="/producer-dashboard">
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Cotações Disponíveis</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Route Summary */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Resumo da Carga</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {freight.cargoType === 'livestock' ? 'Carga Viva' : 
                 freight.cargoType === 'grains' ? 'Grãos' : 'Máquinas'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">
                  {freight.quantity} {freight.cargoType === 'livestock' ? freight.animalType : 'ton'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Origem:</span>
                <span className="font-medium">{freight.origin.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destino:</span>
                <span className="font-medium">{freight.destination.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distância:</span>
                <span className="font-medium">{freight.distance} km</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Available Drivers */}
        <h3 className="font-semibold text-gray-800 mb-4">Freteiros Disponíveis</h3>
        
        {quotes && quotes.length > 0 ? (
          <div className="space-y-3">
            {quotes.map((quote: any) => (
              <Card key={quote.id} className="hover:border-whatsapp transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{quote.driver.user?.name}</h4>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 text-xs mr-2">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas ${i < Math.floor(parseFloat(quote.driver.rating || '0')) ? 'fa-star' : 'far fa-star'}`}></i>
                            ))}
                          </div>
                          <span className="text-gray-600 text-xs">
                            {quote.driver.rating} ({quote.driver.totalTrips} fretes)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-whatsapp">{formatCurrency(quote.price)}</p>
                      <p className="text-gray-500 text-xs">{formatCurrency(quote.driver.pricePerKm)}/km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-truck mr-1"></i>
                      <span>{quote.driver.truckType}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-clock mr-1"></i>
                      <span>Chega em {quote.estimatedArrival}min</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleRequestFreight(quote)}
                    disabled={bookingMutation.isPending}
                    className="w-full bg-whatsapp text-white font-semibold py-3 rounded-lg hover:bg-whatsapp-dark transition-colors"
                  >
                    {bookingMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Solicitar Frete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-truck text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600">Nenhum freteiro disponível no momento</p>
              <p className="text-gray-500 text-sm mt-2">Tente novamente em alguns minutos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
