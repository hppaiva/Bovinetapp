import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { calculateArrobaPrice } from "@/lib/utils";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import VideoUpload from "@/components/video-upload";
import LocationPicker from "@/components/location-picker";
import { Search, Plus, List, MapPin, MessageCircle, Play, Eye } from "lucide-react";

const listingSchema = z.object({
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  sex: z.enum(["macho", "femea"], { required_error: "Sexo é obrigatório" }),
  age: z.enum(["ate12", "12a24", "24a36", "36a48", "mais48"], { required_error: "Idade é obrigatória" }),
  weight: z.number().min(1, "Peso deve ser maior que 0"),
  pricePerHead: z.number().min(1, "Preço deve ser maior que 0"),
  aptitude: z.enum(["corte", "leite"], { required_error: "Aptidão é obrigatória" }),
  description: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
});

type ListingForm = z.infer<typeof listingSchema>;

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("buy");
  const [filters, setFilters] = useState({
    sex: [] as string[],
    aptitude: [] as string[],
    age: "",
    distance: 100, // Default to 100km
    search: "",
  });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["/api/listings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sex.length > 0) params.append("sex", filters.sex.join(","));
      if (filters.aptitude.length > 0) params.append("aptitude", filters.aptitude.join(","));
      if (filters.age && filters.age !== "all") params.append("age", filters.age);
      if (filters.distance) params.append("maxDistance", filters.distance.toString());
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/listings?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch listings");
      return response.json();
    },
  });

  const { data: userListings } = useQuery({
    queryKey: ["/api/listings/user", user?.user?.id],
    enabled: !!user?.user?.id,
  });

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      quantity: 1,
      weight: 0,
      pricePerHead: 0,
      description: "",
      city: "",
      sex: "" as "macho" | "femea",
      aptitude: "" as "corte" | "leite", 
      age: "" as "ate12" | "12a24" | "24a36" | "36a48" | "mais48",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      if (selectedVideo) {
        formData.append("video", selectedVideo);
      }

      if (coordinates) {
        formData.append("latitude", coordinates.lat.toString());
        formData.append("longitude", coordinates.lng.toString());
      }

      const response = await fetch("/api/listings", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu anúncio está agora disponível no marketplace",
      });
      form.reset();
      setSelectedVideo(null);
      setCoordinates(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar anúncio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["buy", "sell", "my-listings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Set default values for filters to avoid empty string errors
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      age: prev.age || "all"
    }));
  }, []);

  const handleFilterChange = (type: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const watchedWeight = form.watch("weight");
  const watchedPrice = form.watch("pricePerHead");
  const arrobaPrice = watchedWeight && watchedPrice ? calculateArrobaPrice(watchedWeight, watchedPrice) : 0;

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-container-bg">
            <TabsTrigger 
              value="buy" 
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Comprar
            </TabsTrigger>
            <TabsTrigger 
              value="sell"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Vender
            </TabsTrigger>
            <TabsTrigger 
              value="my-listings"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Meus Anúncios
            </TabsTrigger>
          </TabsList>

          {/* Buy Tab */}
          <TabsContent value="buy" className="space-y-6">
            {/* Filters */}
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Filtrar Animais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Buscar por raça, cidade..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="bg-primary-bg border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Sexo</Label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="macho"
                          checked={filters.sex.includes("macho")}
                          onCheckedChange={(checked) => {
                            const newSex = checked 
                              ? [...filters.sex, "macho"]
                              : filters.sex.filter(s => s !== "macho");
                            handleFilterChange("sex", newSex);
                          }}
                        />
                        <Label htmlFor="macho" className="text-white">Macho</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="femea"
                          checked={filters.sex.includes("femea")}
                          onCheckedChange={(checked) => {
                            const newSex = checked 
                              ? [...filters.sex, "femea"]
                              : filters.sex.filter(s => s !== "femea");
                            handleFilterChange("sex", newSex);
                          }}
                        />
                        <Label htmlFor="femea" className="text-white">Fêmea</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Aptidão</Label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="corte"
                          checked={filters.aptitude.includes("corte")}
                          onCheckedChange={(checked) => {
                            const newAptitude = checked 
                              ? [...filters.aptitude, "corte"]
                              : filters.aptitude.filter(a => a !== "corte");
                            handleFilterChange("aptitude", newAptitude);
                          }}
                        />
                        <Label htmlFor="corte" className="text-white">Corte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="leite"
                          checked={filters.aptitude.includes("leite")}
                          onCheckedChange={(checked) => {
                            const newAptitude = checked 
                              ? [...filters.aptitude, "leite"]
                              : filters.aptitude.filter(a => a !== "leite");
                            handleFilterChange("aptitude", newAptitude);
                          }}
                        />
                        <Label htmlFor="leite" className="text-white">Leite</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Idade</Label>
                    <Select value={filters.age} onValueChange={(value) => handleFilterChange("age", value)}>
                      <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                        <SelectValue placeholder="Todas as idades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as idades</SelectItem>
                        <SelectItem value="ate12">Até 12 meses</SelectItem>
                        <SelectItem value="12a24">12 a 24 meses</SelectItem>
                        <SelectItem value="24a36">24 a 36 meses</SelectItem>
                        <SelectItem value="36a48">36 a 48 meses</SelectItem>
                        <SelectItem value="mais48">Mais de 48 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">
                      Raio de distância: {filters.distance} km
                    </Label>
                    <div className="space-y-3">
                      <Slider
                        value={[filters.distance]}
                        onValueChange={(value) => handleFilterChange("distance", value[0])}
                        max={500}
                        min={1}
                        step={1}
                        className="w-full [&_.bg-primary]:bg-accent-green [&_[role=slider]]:border-accent-green [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-lg"
                      />
                      <div className="flex justify-between text-xs text-secondary">
                        <span>1 km</span>
                        <span>500 km</span>
                      </div>
                    </div>
                  </div>


                </div>

                <Button className="w-full bg-accent-green hover:bg-green-600 text-white">
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>

            {/* Listings */}
            <div className="space-y-6">
              {loadingListings ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto"></div>
                  <p className="text-secondary mt-4">Carregando anúncios...</p>
                </div>
              ) : listings?.listings?.length > 0 ? (
                listings.listings.map((listing: any) => (
                  <Card key={listing.id} className="bg-white text-gray-900 overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        {listing.videoUrl ? (
                          <div className="h-48 md:h-full bg-gray-200 relative">
                            <video 
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                            >
                              <source src={listing.videoUrl} type="video/mp4" />
                              <source src={listing.videoUrl} type="video/webm" />
                              <source src={listing.videoUrl} type="video/mov" />
                              Seu navegador não suporta reprodução de vídeo.
                            </video>
                          </div>
                        ) : (
                          <div className="h-48 md:h-full bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">Sem vídeo</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold">{listing.title}</h3>
                          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Quantidade</p>
                            <p className="font-semibold">{listing.quantity} animais</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Sexo</p>
                            <p className="font-semibold capitalize">{listing.sex}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Idade</p>
                            <p className="font-semibold">{listing.age}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Peso médio</p>
                            <p className="font-semibold">{listing.weight} kg</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Preço por cabeça:</span>
                            <span className="text-xl font-bold text-green-600">
                              R$ {Number(listing.pricePerHead).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Preço por arroba:</span>
                            <span className="font-semibold">
                              R$ {calculateArrobaPrice(Number(listing.weight), Number(listing.pricePerHead)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{listing.city}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 text-sm">Aptidão: {listing.aptitude}</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button variant="outline" className="flex-1">
                            Ver Detalhes
                          </Button>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              const message = `Olá, tenho interesse no lote "${listing.title}" anunciado no Bovinet.`;
                              const whatsappUrl = generateWhatsAppLink("5534991195042", message);
                              window.open(whatsappUrl, "_blank");
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Tenho Interesse
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <p className="text-secondary text-lg">Nenhum anúncio encontrado</p>
                  <p className="text-secondary text-sm mt-2">
                    Tente ajustar os filtros ou aguarde novos anúncios
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Anunciar Gado para Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit((data) => createListingMutation.mutate(data))} className="space-y-6">


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Aptidão</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="corte-sell"
                            checked={form.watch("aptitude") === "corte"}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue("aptitude", "corte");
                              } else if (form.watch("aptitude") === "corte") {
                                form.setValue("aptitude", "" as any);
                              }
                            }}
                          />
                          <Label htmlFor="corte-sell" className="text-white">Corte</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="leite-sell"
                            checked={form.watch("aptitude") === "leite"}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue("aptitude", "leite");
                              } else if (form.watch("aptitude") === "leite") {
                                form.setValue("aptitude", "" as any);
                              }
                            }}
                          />
                          <Label htmlFor="leite-sell" className="text-white">Leite</Label>
                        </div>
                      </div>
                      {form.formState.errors.aptitude && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.aptitude.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-white">Sexo</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="macho-sell"
                            checked={form.watch("sex") === "macho"}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue("sex", "macho");
                              } else if (form.watch("sex") === "macho") {
                                form.setValue("sex", "" as any);
                              }
                            }}
                          />
                          <Label htmlFor="macho-sell" className="text-white">Macho</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="femea-sell"
                            checked={form.watch("sex") === "femea"}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue("sex", "femea");
                              } else if (form.watch("sex") === "femea") {
                                form.setValue("sex", "" as any);
                              }
                            }}
                          />
                          <Label htmlFor="femea-sell" className="text-white">Fêmea</Label>
                        </div>
                      </div>
                      {form.formState.errors.sex && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.sex.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Idade</Label>
                      <Select onValueChange={(value) => form.setValue("age", value as any)}>
                        <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ate12">Até 12 meses</SelectItem>
                          <SelectItem value="12a24">12 a 24 meses</SelectItem>
                          <SelectItem value="24a36">24 a 36 meses</SelectItem>
                          <SelectItem value="36a48">36 a 48 meses</SelectItem>
                          <SelectItem value="mais48">Mais de 48 meses</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.age && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.age.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Quantidade</Label>
                      <Input
                        {...form.register("quantity", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 10"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {form.formState.errors.quantity && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.quantity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Peso médio (kg)</Label>
                      <Input
                        {...form.register("weight", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 450"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {form.formState.errors.weight && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.weight.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white">Preço por cabeça (R$)</Label>
                      <Input
                        {...form.register("pricePerHead", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 1800"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {form.formState.errors.pricePerHead && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.pricePerHead.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price per arroba display */}
                  {arrobaPrice > 0 && (
                    <div className="bg-accent-green/20 p-4 rounded-lg">
                      <p className="text-accent-green font-semibold">
                        💰 Preço por arroba: R$ {arrobaPrice.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-white">Descrição</Label>
                    <Textarea
                      {...form.register("description")}
                      rows={4}
                      placeholder="Raça, manejo, observações especiais..."
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green resize-none"
                    />
                  </div>

                  <div>
                    <VideoUpload
                      onVideoSelect={setSelectedVideo}
                      selectedVideo={selectedVideo}
                    />
                  </div>

                  <div>
                    <Label className="text-white">Cidade</Label>
                    <Input
                      {...form.register("city")}
                      placeholder="Ex: Araxá - MG"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                    {form.formState.errors.city && (
                      <p className="text-accent-red text-sm mt-1">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <LocationPicker
                      onLocationSelect={setCoordinates}
                      coordinates={coordinates}
                    />
                  </div>



                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" className="flex-1">
                      Salvar Rascunho
                    </Button>
                    <Button
                      type="submit"
                      disabled={createListingMutation.isPending}
                      className="flex-1 bg-accent-green hover:bg-green-600 text-white"
                    >
                      {createListingMutation.isPending ? "Publicando..." : "Publicar Anúncio"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            <div className="space-y-4">
              {userListings?.listings?.length > 0 ? (
                userListings.listings.map((listing: any) => (
                  <Card key={listing.id} className="bg-container-bg border-gray-600">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                          <p className="text-secondary">
                            Publicado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="text-accent-red border-accent-red">
                            {listing.isActive ? "Pausar" : "Ativar"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary">Quantidade</p>
                          <p className="font-semibold text-white">{listing.quantity} animais</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Preço</p>
                          <p className="font-semibold text-white">
                            R$ {Number(listing.pricePerHead).toLocaleString('pt-BR')}/cabeça
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Visualizações</p>
                          <p className="font-semibold text-white">-</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Interessados</p>
                          <p className="font-semibold text-white">-</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={listing.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {listing.isActive ? "Ativo" : "Pausado"}
                        </Badge>
                        <Button variant="ghost" className="text-accent-green hover:text-green-400">
                          Ver estatísticas →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <List className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <p className="text-secondary text-lg">Você ainda não tem anúncios</p>
                  <p className="text-secondary text-sm mt-2">
                    Comece criando seu primeiro anúncio na aba "Vender"
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
