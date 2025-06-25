import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Check, X, MapPin, Truck, Clock, DollarSign } from "lucide-react";

interface FreightAlertsProps {
  truckerId: number;
}

export default function FreightAlerts({ truckerId }: FreightAlertsProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [newAlerts, setNewAlerts] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/freight-alerts", truckerId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/freight-alerts/${truckerId}`, {});
      return response.json();
    },
  });

  const respondToAlertMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/freight-alerts/${alertId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-alerts", truckerId] });
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi registrada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao responder ao alerta",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Connect to WebSocket for real-time alerts
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Register as trucker for alerts
      ws.send(JSON.stringify({
        type: 'register_trucker',
        truckerId: truckerId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'freight_alert') {
          setNewAlerts(prev => [data.alert, ...prev]);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('Novo Frete Disponível!', {
              body: `${data.alert.distance}km - R$ ${data.alert.estimatedPrice}`,
              icon: '/logo.png'
            });
          }
          
          toast({
            title: "🚛 Novo Frete Disponível!",
            description: `${data.alert.distance}km de distância - R$ ${data.alert.estimatedPrice}`,
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(ws);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      ws.close();
    };
  }, [truckerId]);

  const handleAcceptAlert = (alertId: number) => {
    respondToAlertMutation.mutate({ alertId, status: 'accepted' });
    setNewAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleRejectAlert = (alertId: number) => {
    respondToAlertMutation.mutate({ alertId, status: 'rejected' });
    setNewAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const openGoogleMaps = (originLat: number, originLng: number, destLat: number, destLng: number) => {
    const url = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
    window.open(url, '_blank');
  };

  const allAlerts = [...newAlerts, ...(alerts?.alerts || [])];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Alertas de Frete
        </h3>
        {newAlerts.length > 0 && (
          <Badge className="bg-accent-red text-white">
            {newAlerts.length} novo{newAlerts.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto"></div>
          <p className="text-secondary mt-2">Carregando alertas...</p>
        </div>
      ) : allAlerts.length === 0 ? (
        <Card className="bg-container-bg border-gray-600">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 text-secondary mx-auto mb-4" />
            <p className="text-secondary">Nenhum alerta de frete no momento</p>
            <p className="text-sm text-secondary mt-1">
              Você será notificado quando houver fretes na sua região
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allAlerts.map((alert: any) => (
            <Card key={alert.id} className="bg-container-bg border-gray-600">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Solicitação de Frete
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      alert.status === 'pending' ? "bg-yellow-500 text-yellow-900" :
                      alert.status === 'accepted' ? "bg-green-500 text-green-900" :
                      "bg-red-500 text-red-900"
                    }>
                      {alert.status === 'pending' ? 'Pendente' :
                       alert.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                    </Badge>
                    {newAlerts.some(na => na.id === alert.id) && (
                      <Badge className="bg-accent-green text-white">NOVO</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-accent-green" />
                    <div>
                      <p className="text-sm text-secondary">Distância</p>
                      <p className="font-semibold text-white">{alert.distance || alert.distanceKm}km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-accent-green" />
                    <div>
                      <p className="text-sm text-secondary">Valor Estimado</p>
                      <p className="font-semibold text-white">R$ {alert.estimatedPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-accent-green" />
                    <div>
                      <p className="text-sm text-secondary">Animais</p>
                      <p className="font-semibold text-white">{alert.freightRequest?.animalQuantity} bovinos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-accent-green" />
                    <div>
                      <p className="text-sm text-secondary">Solicitado</p>
                      <p className="font-semibold text-white">
                        {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-secondary mb-1">Rota</p>
                  <p className="text-white">
                    {alert.freightRequest?.originAddress} → {alert.freightRequest?.destinationAddress}
                  </p>
                </div>

                {alert.freightRequest?.observations && (
                  <div>
                    <p className="text-sm text-secondary mb-1">Observações</p>
                    <p className="text-white text-sm">{alert.freightRequest.observations}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  {alert.freightRequest?.originLatitude && alert.freightRequest?.destinationLatitude && (
                    <Button
                      variant="outline"
                      onClick={() => openGoogleMaps(
                        Number(alert.freightRequest.originLatitude),
                        Number(alert.freightRequest.originLongitude),
                        Number(alert.freightRequest.destinationLatitude),
                        Number(alert.freightRequest.destinationLongitude)
                      )}
                      className="flex-1"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Ver Rota
                    </Button>
                  )}
                  
                  {alert.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleRejectAlert(alert.id)}
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        disabled={respondToAlertMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Recusar
                      </Button>
                      
                      <Button
                        onClick={() => handleAcceptAlert(alert.id)}
                        className="flex-1 bg-accent-green hover:bg-green-600 text-white"
                        disabled={respondToAlertMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aceitar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}