import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentLocation } from "@/lib/geolocation";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import LocationPicker from "@/components/location-picker";
import FreightAlerts from "@/components/freight-alerts";
import { Search, Truck, List, MapPin, MessageCircle, Clock, CheckCircle } from "lucide-react";

const freightRequestSchema = z.object({
  originAddress: z.string().min(1, "Endereço de origem é obrigatório"),
  destinationAddress: z.string().min(1, "Destino é obrigatório"),
  animalQuantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  animalAge: z.enum(["ate12", "12a24", "24a36", "36a48"], { required_error: "Idade é obrigatória" }),
  preferredDate: z.string().optional(),
  observations: z.string().optional(),
});

const truckerSchema = z.object({
  truckModel: z.enum(["Truck", "Bitruck", "Carreta", "Boiadeiro pequeno"], { required_error: "Modelo é obrigatório" }),
  adultCapacity: z.number().min(1, "Capacidade deve ser maior que 0"),
  calfCapacity: z.number().min(1, "Capacidade deve ser maior que 0"),
  pricePerKm: z.number().min(0.01, "Preço deve ser maior que 0"),
  experience: z.enum(["Menos de 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "Mais de 10 anos"], { required_error: "Experiência é obrigatória" }),
  workingArea: z.string().optional(),
});

type FreightRequestForm = z.infer<typeof freightRequestSchema>;
type TruckerForm = z.infer<typeof truckerSchema>;

export default function Freight() {
  const [activeTab, setActiveTab] = useState("search");
  const [originCoordinates, setOriginCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTruckPhoto, setSelectedTruckPhoto] = useState<File | null>(null);


  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: truckers } = useQuery({
    queryKey: ["/api/truckers", true],
  });

  const { data: userFreightRequests } = useQuery({
    queryKey: ["/api/freight-requests", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const { data: userTrucker } = useQuery({
    queryKey: ["/api/truckers/user", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const freightForm = useForm<FreightRequestForm>({
    resolver: zodResolver(freightRequestSchema),
    defaultValues: {
      originAddress: "",
      destinationAddress: "",
      animalQuantity: 1,
      observations: "",
    },
  });

  const truckerForm = useForm<TruckerForm>({
    resolver: zodResolver(truckerSchema),
    defaultValues: {
      adultCapacity: 1,
      calfCapacity: 1,
      pricePerKm: 0,
      workingArea: "",
    },
  });

  const createFreightRequestMutation = useMutation({
    mutationFn: async (data: FreightRequestForm) => {
      const requestData = {
        ...data,
        preferredDate: data.preferredDate ? new Date(data.preferredDate).toISOString() : undefined,
        originLatitude: originCoordinates?.lat,
        originLongitude: originCoordinates?.lng,
        destinationLatitude: destinationCoordinates?.lat,
        destinationLongitude: destinationCoordinates?.lng,
      };

      const response = await apiRequest("POST", "/api/freight-requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-requests"] });
      toast({
        title: "Solicitação de frete criada!",
        description: "Caminhoneiros disponíveis serão notificados",
      });
      freightForm.reset();
      setOriginCoordinates(null);
      setDestinationCoordinates(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTruckerMutation = useMutation({
    mutationFn: async (data: TruckerForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      if (selectedTruckPhoto) {
        formData.append("truckPhoto", selectedTruckPhoto);
      }



      const response = await fetch("/api/truckers", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/truckers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Cadastro de caminhoneiro realizado!",
        description: "Agora você pode oferecer serviços de frete",
      });
      truckerForm.reset();
      setSelectedTruckPhoto(null);

    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTruckerAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: number; isAvailable: boolean }) => {
      if (isAvailable) {
        // Get current location first
        const position = await getCurrentLocation();
        await apiRequest("PUT", `/api/truckers/${id}/location`, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }

      const response = await apiRequest("PUT", `/api/truckers/${id}/availability`, { isAvailable });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/truckers"] });
      toast({
        title: "Status atualizado!",
        description: "Sua disponibilidade foi atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["search", "offer", "my-requests"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      const coords = { 
        lat: position.coords.latitude, 
        lng: position.coords.longitude 
      };
      setOriginCoordinates(coords);
      freightForm.setValue("originAddress", `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      toast({
        title: "Localização capturada!",
        description: "Sua localização atual foi adicionada",
      });
    } catch (error: any) {
      toast({
        title: "Erro de localização",
        description: error.message || "Não foi possível obter sua localização",
        variant: "destructive",
      });
    }
  };

  const handleUseDestinationLocation = async () => {
    try {
      const position = await getCurrentLocation();
      const coords = { 
        lat: position.coords.latitude, 
        lng: position.coords.longitude 
      };
      setDestinationCoordinates(coords);
      freightForm.setValue("destinationAddress", `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      toast({
        title: "Localização de destino capturada!",
        description: "Localização foi adicionada como destino",
      });
    } catch (error: any) {
      toast({
        title: "Erro de localização",
        description: error.message || "Não foi possível obter sua localização",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-container-bg">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Frete
            </TabsTrigger>
            <TabsTrigger 
              value="offer"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              Oferecer Frete
            </TabsTrigger>
            <TabsTrigger 
              value="my-requests"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Meus Pedidos
            </TabsTrigger>
          </TabsList>

          {/* Search Freight Tab */}
          <TabsContent value="search" className="space-y-8">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Buscar Frete para Transporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={freightForm.handleSubmit((data) => createFreightRequestMutation.mutate(data))} className="space-y-6">
                  <div>
                    <Label className="text-white flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      Localização de Origem
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        {...freightForm.register("originAddress")}
                        placeholder="Digite seu endereço ou cidade"
                        className="flex-1 bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      <Button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="bg-accent-green hover:bg-green-600 text-white whitespace-nowrap"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Usar minha localização
                      </Button>
                    </div>
                    {freightForm.formState.errors.originAddress && (
                      <p className="text-accent-red text-sm mt-1">
                        {freightForm.formState.errors.originAddress.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      Destino
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        {...freightForm.register("destinationAddress")}
                        placeholder="Cidade ou nome da fazenda de destino"
                        className="flex-1 bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      <Button
                        type="button"
                        onClick={handleUseDestinationLocation}
                        className="bg-accent-green hover:bg-green-600 text-white whitespace-nowrap"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Usar localização atual
                      </Button>
                    </div>
                    {freightForm.formState.errors.destinationAddress && (
                      <p className="text-accent-red text-sm mt-1">
                        {freightForm.formState.errors.destinationAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Idade dos Animais</Label>
                      <Select onValueChange={(value) => freightForm.setValue("animalAge", value as any)}>
                        <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ate12">Até 12 meses</SelectItem>
                          <SelectItem value="12a24">12 a 24 meses</SelectItem>
                          <SelectItem value="24a36">24 a 36 meses</SelectItem>
                          <SelectItem value="36a48">36 a 48 meses</SelectItem>
                        </SelectContent>
                      </Select>
                      {freightForm.formState.errors.animalAge && (
                        <p className="text-accent-red text-sm mt-1">
                          {freightForm.formState.errors.animalAge.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Quantidade de Animais</Label>
                      <Input
                        {...freightForm.register("animalQuantity", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 18"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {freightForm.formState.errors.animalQuantity && (
                        <p className="text-accent-red text-sm mt-1">
                          {freightForm.formState.errors.animalQuantity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Data preferencial</Label>
                    <Input
                      {...freightForm.register("preferredDate")}
                      type="date"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Observações</Label>
                    <Textarea
                      {...freightForm.register("observations")}
                      rows={3}
                      placeholder="Informações adicionais sobre o transporte..."
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createFreightRequestMutation.isPending}
                    className="w-full bg-accent-green hover:bg-green-600 text-white text-lg py-3"
                  >
                    {createFreightRequestMutation.isPending ? "Criando..." : "BUSCAR FRETE"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Available Truckers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Caminhoneiros Disponíveis</h3>
              <div className="space-y-4">
                {truckers?.truckers?.length > 0 ? (
                  truckers.truckers.map((trucker: any) => (
                    <Card key={trucker.id} className="bg-container-bg border-gray-600">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-white">
                              {trucker.user?.name || "Caminhoneiro"}
                            </h4>
                            <p className="text-secondary">{trucker.user?.city || "Localização não informada"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent-green font-semibold">
                              R$ {Number(trucker.pricePerKm).toFixed(2)}/km
                            </p>
                            <p className="text-sm text-secondary">
                              {trucker.isAvailable ? "Disponível agora" : "Indisponível"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-secondary">Tipo do veículo</p>
                            <p className="font-medium text-white">{trucker.truckModel}</p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary">Capacidade</p>
                            <p className="font-medium text-white">{trucker.adultCapacity} adultos</p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button variant="outline" className="flex-1">
                            Ver Perfil
                          </Button>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              const message = `Olá, tenho interesse em contratar seus serviços de frete através do Bovinet.`;
                              const whatsappUrl = generateWhatsAppLink(trucker.user?.phone || "", message);
                              window.open(whatsappUrl, "_blank");
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contatar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-secondary mx-auto mb-4" />
                    <p className="text-secondary">Nenhum caminhoneiro disponível no momento</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Offer Freight Tab */}
          <TabsContent value="offer">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Cadastro de Caminhoneiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={truckerForm.handleSubmit((data) => createTruckerMutation.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Modelo do caminhão</Label>
                      <Select onValueChange={(value) => truckerForm.setValue("truckModel", value as any)}>
                        <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Bitruck">Bitruck</SelectItem>
                          <SelectItem value="Carreta">Carreta</SelectItem>
                          <SelectItem value="Boiadeiro pequeno">Boiadeiro pequeno</SelectItem>
                        </SelectContent>
                      </Select>
                      {truckerForm.formState.errors.truckModel && (
                        <p className="text-accent-red text-sm mt-1">
                          {truckerForm.formState.errors.truckModel.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Capacidade - Animais adultos</Label>
                      <Input
                        {...truckerForm.register("adultCapacity", { valueAsNumber: true })}
                        type="number"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {truckerForm.formState.errors.adultCapacity && (
                        <p className="text-accent-red text-sm mt-1">
                          {truckerForm.formState.errors.adultCapacity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Capacidade - Bezerros</Label>
                      <Input
                        {...truckerForm.register("calfCapacity", { valueAsNumber: true })}
                        type="number"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {truckerForm.formState.errors.calfCapacity && (
                        <p className="text-accent-red text-sm mt-1">
                          {truckerForm.formState.errors.calfCapacity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Preço por KM (R$)</Label>
                      <Input
                        {...truckerForm.register("pricePerKm", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {truckerForm.formState.errors.pricePerKm && (
                        <p className="text-accent-red text-sm mt-1">
                          {truckerForm.formState.errors.pricePerKm.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Experiência</Label>
                      <Select onValueChange={(value) => truckerForm.setValue("experience", value as any)}>
                        <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Menos de 1 ano">Menos de 1 ano</SelectItem>
                          <SelectItem value="1-3 anos">1-3 anos</SelectItem>
                          <SelectItem value="3-5 anos">3-5 anos</SelectItem>
                          <SelectItem value="5-10 anos">5-10 anos</SelectItem>
                          <SelectItem value="Mais de 10 anos">Mais de 10 anos</SelectItem>
                        </SelectContent>
                      </Select>
                      {truckerForm.formState.errors.experience && (
                        <p className="text-accent-red text-sm mt-1">
                          {truckerForm.formState.errors.experience.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Área de atuação</Label>
                    <Textarea
                      {...truckerForm.register("workingArea")}
                      rows={3}
                      placeholder="Descreva as regiões onde você atua..."
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Foto do caminhão</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedTruckPhoto(e.target.files?.[0] || null)}
                      className="bg-primary-bg border-gray-600 text-white file:text-white file:bg-accent-green file:border-0 file:rounded file:px-2 file:py-1"
                    />
                    {selectedTruckPhoto && (
                      <p className="text-accent-green text-sm mt-1">
                        ✓ {selectedTruckPhoto.name}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" className="flex-1">
                      Salvar Rascunho
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTruckerMutation.isPending}
                      className="flex-1 bg-success-green hover:bg-green-600 text-primary-bg"
                    >
                      {createTruckerMutation.isPending ? "Cadastrando..." : "Cadastrar Caminhoneiro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Trucker Status Panel (if already registered) */}
            {userTrucker?.trucker && (
              <>
                <Card className="mt-8 bg-container-bg border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Status do Caminhoneiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-white">{user?.user?.name}</p>
                        <p className="text-secondary">
                          {userTrucker.trucker.truckModel} - {userTrucker.trucker.adultCapacity} animais
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-secondary">Status</p>
                        <p className={`font-semibold ${userTrucker.trucker.isAvailable ? 'text-accent-green' : 'text-accent-red'}`}>
                          {userTrucker.trucker.isAvailable ? "Disponível" : "Indisponível"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => updateTruckerAvailabilityMutation.mutate({
                        id: userTrucker.trucker.id,
                        isAvailable: !userTrucker.trucker.isAvailable
                      })}
                      disabled={updateTruckerAvailabilityMutation.isPending}
                      className="w-full bg-accent-green hover:bg-green-600 text-white"
                    >
                      {updateTruckerAvailabilityMutation.isPending 
                        ? "Atualizando..." 
                        : userTrucker.trucker.isAvailable 
                          ? "Marcar como Indisponível" 
                          : "Marcar como Disponível"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Freight Alerts for Truckers */}
                <div className="mt-8">
                  <FreightAlerts truckerId={userTrucker.trucker.id} />
                </div>
              </>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests">
            <div className="space-y-4">
              {userFreightRequests?.requests?.length > 0 ? (
                userFreightRequests.requests.map((request: any) => (
                  <Card key={request.id} className="bg-container-bg border-gray-600">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {request.originAddress} → {request.destinationAddress}
                          </h3>
                          <p className="text-secondary">
                            Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge className={
                          request.status === 'pending' ? "bg-yellow-500 text-yellow-900" :
                          request.status === 'matched' ? "bg-blue-500 text-blue-900" :
                          request.status === 'completed' ? "bg-green-500 text-green-900" :
                          "bg-gray-500 text-gray-900"
                        }>
                          {request.status === 'pending' ? 'Pendente' :
                           request.status === 'matched' ? 'Aceito' :
                           request.status === 'completed' ? 'Concluído' :
                           'Cancelado'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary">Animais</p>
                          <p className="font-semibold text-white">{request.animalQuantity} bovinos</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Idade</p>
                          <p className="font-semibold text-white">{request.animalAge}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary">
                          {request.status === 'pending' ? 'Aguardando propostas' : 'Processado'}
                        </p>
                        {request.status === 'pending' && (
                          <Button variant="ghost" className="text-accent-green hover:text-green-400">
                            Ver propostas →
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <List className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <p className="text-secondary text-lg">Você ainda não fez solicitações de frete</p>
                  <p className="text-secondary text-sm mt-2">
                    Comece criando sua primeira solicitação na aba "Buscar Frete"
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
