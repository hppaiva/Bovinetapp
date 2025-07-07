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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { FileText, UserCheck, Folder, Info, Clock, Truck, Search, MapPin, Calculator, MessageCircle } from "lucide-react";

const freightRequestSchema = z.object({
  originAddress: z.string().min(1, "Endereço de origem é obrigatório"),
  destinationAddress: z.string().min(1, "Destino é obrigatório"),
  animalQuantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  animalAge: z.enum(["ate12", "12a24", "24a36", "36a48"], { required_error: "Idade é obrigatória" }),
  preferredDate: z.string().optional(),
  observations: z.string().optional(),
});

const gtaRequestSchema = z.object({
  farmName: z.string().min(1, "Nome da fazenda é obrigatório"),
  ownerName: z.string().min(1, "Nome do proprietário é obrigatório"),
  ownerDocument: z.string().min(1, "Documento é obrigatório"),
  originCity: z.string().min(1, "Cidade de origem é obrigatória"),
  animalQuantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  species: z.enum(["Bovinos", "Suínos", "Equinos", "Bubalinos"], { required_error: "Espécie é obrigatória" }),
  sex: z.enum(["Macho", "Fêmea"], { required_error: "Sexo é obrigatório" }),
  age: z.enum(["até 12 meses", "de 12 a 24", "24 a 36", "36 a 48", "acima de 48"], { required_error: "Idade é obrigatória" }),
  purpose: z.enum(["Abate", "Reprodução", "Engorda", "Exposição"], { required_error: "Finalidade é obrigatória" }),
  totalWeight: z.number().min(1, "Peso total deve ser maior que 0"),
  destinationCity: z.string().min(1, "Cidade de destino é obrigatória"),
  destinationFarm: z.string().min(1, "Fazenda de destino é obrigatória"),
  destinationOwner: z.string().min(1, "Nome do destinatário é obrigatório"),
  destinationDocument: z.string().min(1, "Documento do destinatário é obrigatório"),
  observations: z.string().optional(),
});

type FreightRequestForm = z.infer<typeof freightRequestSchema>;
type GTARequestForm = z.infer<typeof gtaRequestSchema>;

export default function Services() {
  const [activeTab, setActiveTab] = useState("freight");
  const [distance, setDistance] = useState("");
  const [freightPrice, setFreightPrice] = useState(0);
  const [originCoordinates, setOriginCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: gtaRequests } = useQuery({
    queryKey: ["/api/gta-requests", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const { data: freightRequests } = useQuery({
    queryKey: ["/api/freight-requests", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const freightForm = useForm<FreightRequestForm>({
    resolver: zodResolver(freightRequestSchema),
    defaultValues: {
      originAddress: "",
      destinationAddress: "",
      animalQuantity: 1,
      animalAge: "ate12" as any,
      preferredDate: "",
      observations: "",
    },
  });

  const gtaForm = useForm<GTARequestForm>({
    resolver: zodResolver(gtaRequestSchema),
    defaultValues: {
      farmName: "",
      ownerName: "",
      ownerDocument: "",
      originCity: "",
      animalQuantity: 1,
      totalWeight: 0,
      destinationCity: "",
      destinationFarm: "",
      destinationOwner: "",
      destinationDocument: "",
      observations: "",
    },
  });

  const createFreightRequestMutation = useMutation({
    mutationFn: async (data: FreightRequestForm) => {
      const requestData = {
        ...data,
        originLatitude: originCoordinates?.lat,
        originLongitude: originCoordinates?.lng,
        destinationLatitude: destinationCoordinates?.lat,
        destinationLongitude: destinationCoordinates?.lng,
        preferredDate: data.preferredDate ? new Date(data.preferredDate).toISOString() : null,
      };
      
      const response = await apiRequest("POST", "/api/freight-requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-requests"] });
      toast({
        title: "🚚 Solicitação de frete enviada!",
        description: "Transportadores próximos serão notificados via WhatsApp",
      });
      freightForm.reset();
      setOriginCoordinates(null);
      setDestinationCoordinates(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao solicitar frete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createGTARequestMutation = useMutation({
    mutationFn: async (data: GTARequestForm) => {
      const response = await apiRequest("POST", "/api/gta-requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gta-requests"] });
      toast({
        title: "Solicitação de GTA enviada!",
        description: "Sua solicitação será analisada por um veterinário credenciado",
      });
      gtaForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["freight", "gta", "veterinary", "documents"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Calculate freight price
  const calculateFreight = () => {
    const dist = parseFloat(distance);
    if (dist > 0) {
      const pricePerKm = 3.50; // R$ 3,50 por km
      const totalPrice = dist * pricePerKm;
      setFreightPrice(totalPrice);
      
      toast({
        title: "Cálculo realizado!",
        description: `Distância: ${dist}km • Preço: R$ ${totalPrice.toFixed(2)}`,
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setOriginCoordinates(coords);
          
          // Reverse geocoding simulation
          freightForm.setValue("originAddress", `Localização atual: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          
          toast({
            title: "Localização obtida!",
            description: "Sua localização atual foi definida como origem",
          });
        },
        () => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Localização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-yellow-500 text-yellow-900";
      case 'approved': return "bg-blue-500 text-blue-900";
      case 'issued': return "bg-green-500 text-green-900";
      case 'rejected': return "bg-red-500 text-red-900";
      default: return "bg-gray-500 text-gray-900";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return "Em análise";
      case 'approved': return "Aprovada";
      case 'issued': return "Emitida";
      case 'rejected': return "Rejeitada";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-container-bg">
            <TabsTrigger 
              value="freight"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              🚚 Frete
            </TabsTrigger>
            <TabsTrigger 
              value="gta" 
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              📄 GTA
            </TabsTrigger>
            <TabsTrigger 
              value="veterinary"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              👨‍⚕️ Veterinários
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Folder className="w-4 h-4 mr-2" />
              📁 Documentos
            </TabsTrigger>
          </TabsList>

          {/* Freight Tab */}
          <TabsContent value="freight" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Freight Request Form */}
              <Card className="card-enhanced bg-container-bg border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Solicitar Transporte de Gado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={freightForm.handleSubmit((data) => createFreightRequestMutation.mutate(data))} className="form-enhanced space-y-6">
                    <div>
                      <Label className="text-white flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        Localização de Origem *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...freightForm.register("originAddress")}
                          placeholder="Digite seu endereço ou cidade"
                          className="flex-1 bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                        >
                          📍 GPS
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
                        Destino *
                      </Label>
                      <Input
                        {...freightForm.register("destinationAddress")}
                        placeholder="Para onde você quer transportar?"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {freightForm.formState.errors.destinationAddress && (
                        <p className="text-accent-red text-sm mt-1">
                          {freightForm.formState.errors.destinationAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Quantidade de Animais *</Label>
                        <Input
                          {...freightForm.register("animalQuantity", { valueAsNumber: true })}
                          type="number"
                          placeholder="Ex: 50"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {freightForm.formState.errors.animalQuantity && (
                          <p className="text-accent-red text-sm mt-1">
                            {freightForm.formState.errors.animalQuantity.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-white">Idade dos Animais *</Label>
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
                    </div>

                    <div>
                      <Label className="text-white">Data Preferencial</Label>
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
                      className="btn-primary w-full bg-accent-green hover:bg-green-600 text-white py-3"
                    >
                      {createFreightRequestMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </div>
                      ) : (
                        "🚚 Solicitar Frete Agora"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Freight Calculator */}
              <Card className="card-enhanced bg-container-bg border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculadora de Frete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-white">Distância (km)</Label>
                    <Input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="Ex: 400"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                  </div>

                  <Button 
                    onClick={calculateFreight}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!distance || parseFloat(distance) <= 0}
                  >
                    <Calculator className="mr-2" size={16} />
                    Calcular Frete
                  </Button>

                  {freightPrice > 0 && (
                    <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                      <h4 className="font-semibold text-green-800 mb-2">💰 Resultado do Cálculo</h4>
                      <div className="text-green-700 space-y-1">
                        <p>📏 Distância: {distance} km</p>
                        <p>💵 Preço por km: R$ 3,50</p>
                        <p className="text-lg font-bold">🎯 Total estimado: R$ {freightPrice.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        * Valor estimado. Preço final pode variar conforme negociação.
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Como funciona</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Valor base: R$ 3,50 por quilômetro</li>
                      <li>• Inclui combustível e pedágio</li>
                      <li>• Transportadores verificados</li>
                      <li>• Notificação automática via WhatsApp</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Freight Requests History */}
            {freightRequests?.requests?.length > 0 && (
              <Card className="card-enhanced bg-container-bg border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <List className="w-5 h-5 mr-2" />
                    Suas Solicitações de Frete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {freightRequests.requests.map((request: any) => (
                      <div key={request.id} className="bg-primary-bg p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">
                              {request.originAddress} → {request.destinationAddress}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {request.animalQuantity} animais • {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={
                            request.status === 'pending' ? "bg-yellow-500 text-yellow-900" :
                            request.status === 'matched' ? "bg-blue-500 text-blue-900" :
                            request.status === 'completed' ? "bg-green-500 text-green-900" :
                            "bg-gray-500 text-gray-900"
                          }>
                            {request.status === 'pending' ? "⏳ Aguardando" :
                             request.status === 'matched' ? "🚛 Transportador encontrado" :
                             request.status === 'completed' ? "✅ Concluído" :
                             "❓ Status desconhecido"}
                          </Badge>
                        </div>

                        {request.matchedTruckerId && (
                          <div className="mt-3 p-3 bg-green-100 rounded-lg">
                            <p className="text-green-800 font-semibold">🚛 Transportador encontrado!</p>
                            <Button
                              className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                const message = `Olá! Sobre o frete de ${request.animalQuantity} animais de ${request.originAddress} para ${request.destinationAddress}. Gostaria de confirmar o transporte.`;
                                window.open(`https://wa.me/5534991195042?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Falar no WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* GTA Tab */}
          <TabsContent value="gta" className="space-y-8">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Solicitar Emissão de GTA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={gtaForm.handleSubmit((data) => createGTARequestMutation.mutate(data))} className="space-y-6">
                  {/* Origin Information */}
                  <div className="border-l-4 border-accent-green pl-4">
                    <h4 className="font-semibold text-lg mb-4 text-white">Informações de Origem</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Nome da Fazenda</Label>
                        <Input
                          {...gtaForm.register("farmName")}
                          placeholder="Fazenda Santa Clara"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.farmName && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.farmName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Nome do Proprietário</Label>
                        <Input
                          {...gtaForm.register("ownerName")}
                          placeholder="João da Silva"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.ownerName && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.ownerName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Número do Produtor ou CPF</Label>
                        <Input
                          {...gtaForm.register("ownerDocument")}
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.ownerDocument && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.ownerDocument.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Cidade de Origem</Label>
                        <Input
                          {...gtaForm.register("originCity")}
                          placeholder="Araxá - MG"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.originCity && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.originCity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Animal Information */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-lg mb-4 text-white">Informações dos Animais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Quantidade de Animais</Label>
                        <Input
                          {...gtaForm.register("animalQuantity", { valueAsNumber: true })}
                          type="number"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.animalQuantity && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.animalQuantity.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Espécie</Label>
                        <Select onValueChange={(value) => gtaForm.setValue("species", value as any)}>
                          <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bovinos">Bovinos</SelectItem>
                            <SelectItem value="Suínos">Suínos</SelectItem>
                            <SelectItem value="Equinos">Equinos</SelectItem>
                            <SelectItem value="Bubalinos">Bubalinos</SelectItem>
                          </SelectContent>
                        </Select>
                        {gtaForm.formState.errors.species && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.species.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Sexo</Label>
                        <Select onValueChange={(value) => gtaForm.setValue("sex", value as any)}>
                          <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Macho">Macho</SelectItem>
                            <SelectItem value="Fêmea">Fêmea</SelectItem>
                          </SelectContent>
                        </Select>
                        {gtaForm.formState.errors.sex && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.sex.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Idade</Label>
                        <Select onValueChange={(value) => gtaForm.setValue("age", value as any)}>
                          <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="até 12 meses">até 12 meses</SelectItem>
                            <SelectItem value="de 12 a 24">de 12 a 24</SelectItem>
                            <SelectItem value="24 a 36">24 a 36</SelectItem>
                            <SelectItem value="36 a 48">36 a 48</SelectItem>
                            <SelectItem value="acima de 48">acima de 48</SelectItem>
                          </SelectContent>
                        </Select>
                        {gtaForm.formState.errors.age && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.age.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Finalidade</Label>
                        <Select onValueChange={(value) => gtaForm.setValue("purpose", value as any)}>
                          <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Abate">Abate</SelectItem>
                            <SelectItem value="Reprodução">Reprodução</SelectItem>
                            <SelectItem value="Engorda">Engorda</SelectItem>
                            <SelectItem value="Exposição">Exposição</SelectItem>
                          </SelectContent>
                        </Select>
                        {gtaForm.formState.errors.purpose && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.purpose.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Peso Total (kg)</Label>
                        <Input
                          {...gtaForm.register("totalWeight", { valueAsNumber: true })}
                          type="number"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.totalWeight && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.totalWeight.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destination Information */}
                  <div className="border-l-4 border-accent-red pl-4">
                    <h4 className="font-semibold text-lg mb-4 text-white">Informações de Destino</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Destino</Label>
                        <Input
                          {...gtaForm.register("destinationCity")}
                          placeholder="Cidade/Estado de destino"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.destinationCity && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.destinationCity.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Fazenda Destinatária</Label>
                        <Input
                          {...gtaForm.register("destinationFarm")}
                          placeholder="Fazenda Morro Alto"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.destinationFarm && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.destinationFarm.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Nome Destinatário</Label>
                        <Input
                          {...gtaForm.register("destinationOwner")}
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.destinationOwner && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.destinationOwner.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white">Número Produtor ou CPF do Destinatário</Label>
                        <Input
                          {...gtaForm.register("destinationDocument")}
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {gtaForm.formState.errors.destinationDocument && (
                          <p className="text-accent-red text-sm mt-1">
                            {gtaForm.formState.errors.destinationDocument.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Observações</Label>
                    <Textarea
                      {...gtaForm.register("observations")}
                      rows={4}
                      placeholder="Informações adicionais para o veterinário..."
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green resize-none"
                    />
                  </div>

                  <Alert className="bg-yellow-500/20 border-yellow-500">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-yellow-100">
                      <strong>Importante:</strong> A solicitação será enviada para um veterinário credenciado. 
                      O prazo para emissão é de 24-48 horas úteis.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    disabled={createGTARequestMutation.isPending}
                    className="w-full bg-accent-red hover:bg-red-600 text-white text-lg py-3"
                  >
                    {createGTARequestMutation.isPending ? "Enviando..." : "Enviar Solicitação de GTA"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* GTA Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Minhas Solicitações de GTA</h3>
              <div className="space-y-4">
                {gtaRequests?.requests?.length > 0 ? (
                  gtaRequests.requests.map((request: any) => (
                    <Card key={request.id} className="bg-container-bg border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white">
                              GTA #{request.gtaNumber || `#${request.id.toString().padStart(6, '0')}`}
                            </p>
                            <p className="text-sm text-secondary">
                              {request.animalQuantity} {request.species.toLowerCase()} - {request.originCity} → {request.destinationCity}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary">
                          Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-secondary mx-auto mb-4" />
                    <p className="text-secondary">Nenhuma solicitação de GTA ainda</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Veterinary Tab */}
          <TabsContent value="veterinary">
            <Card className="bg-container-bg border-gray-600">
              <CardContent className="p-6 text-center">
                <UserCheck className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Serviços Veterinários</h3>
                <p className="text-secondary">Em desenvolvimento</p>
                <p className="text-sm text-secondary mt-2">
                  Em breve você poderá encontrar e contratar veterinários credenciados
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="bg-container-bg border-gray-600">
              <CardContent className="p-6 text-center">
                <Folder className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Gestão de Documentos</h3>
                <p className="text-secondary">Em desenvolvimento</p>
                <p className="text-sm text-secondary mt-2">
                  Em breve você poderá gerenciar todos os seus documentos relacionados ao gado
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
