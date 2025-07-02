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
import { FileText, UserCheck, Folder, Info, Clock, Truck, Search } from "lucide-react";

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

type GTARequestForm = z.infer<typeof gtaRequestSchema>;

export default function Services() {
  const [activeTab, setActiveTab] = useState("gta");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: gtaRequests } = useQuery({
    queryKey: ["/api/gta-requests", user?.user?.id],
    enabled: !!user?.user?.id,
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
    if (tab && ["gta", "veterinary", "documents"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

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
              value="gta" 
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Emitir GTA
            </TabsTrigger>
            <TabsTrigger 
              value="freight"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              Frete
            </TabsTrigger>
            <TabsTrigger 
              value="veterinary"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Veterinários
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Folder className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>

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
