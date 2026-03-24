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
import { brazilianStates, getCitiesByState } from "../data/brazilian-locations";
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
  state: z.string().min(1, "Estado é obrigatório"),
});

type ListingForm = z.infer<typeof listingSchema>;

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "buy";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filters, setFilters] = useState({
    sex: [] as string[],
    aptitude: [] as string[],
    age: "",
    distance: 100, // Default to 100km
    search: "",
    state: "",
    city: "",
  });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: user, error: userError, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // No polling - use localStorage auth as fallback

  // Check localStorage auth as fallback (computed before hooks that depend on it)
  const localAuth = localStorage.getItem('user');
  const isLocallyAuthenticated = !!localAuth;
  let currentUser: any = user;
  if (!currentUser?.user && isLocallyAuthenticated) {
    try {
      const userData = JSON.parse(localAuth!);
      currentUser = { user: userData };
    } catch (e) {
      // ignore parse errors
    }
  }

  // All queries/hooks must come before any conditional return
  const { data: listings, isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ["/api/listings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sex.length > 0) params.append("sex", filters.sex.join(","));
      if (filters.aptitude.length > 0) params.append("aptitude", filters.aptitude.join(","));
      if (filters.age && filters.age !== "all") params.append("age", filters.age);
      if (filters.distance) params.append("maxDistance", filters.distance.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.state) params.append("state", filters.state);
      if (filters.city) params.append("city", filters.city);

      console.log("=== FETCHING LISTINGS ===");
      console.log("Filters:", filters);
      console.log("URL:", `/api/listings?${params.toString()}`);

      const response = await fetch(`/api/listings?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      console.log("Listings fetched:", data);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: userListings } = useQuery({
    queryKey: ["/api/listings/user"],
    enabled: !!(currentUser?.user?.id || isLocallyAuthenticated),
    queryFn: async () => {
      const response = await fetch("/api/listings/user", {
        credentials: "include",
      });
      if (!response.ok) {
        // Fallback to all listings if user-specific fails
        console.log("Failed to fetch user listings, using all listings");
        return { listings: [] };
      }
      return response.json();
    },
  });

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      quantity: 1,
      weight: 0,
      pricePerHead: 0,
      description: "",
      state: "",
      city: "",
      sex: "" as "macho" | "femea",
      aptitude: "" as "corte" | "leite", 
      age: "" as "ate12" | "12a24" | "24a36" | "36a48" | "mais48",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
      console.log("=== LISTING CREATION DEBUG ===");
      console.log("Form data:", data);
      console.log("Selected video:", selectedVideo);
      console.log("Coordinates:", coordinates);
      console.log("User:", user);

      const authUser = currentUser?.user || JSON.parse(localStorage.getItem('user') || '{}');
      if (!authUser?.id) {
        console.error("User not authenticated for listing creation");
        throw new Error("Você precisa estar logado para criar um anúncio. Faça login novamente.");
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      if (selectedVideo) {
        formData.append("video", selectedVideo);
      }

      if (coordinates) {
        formData.append("latitude", coordinates.lat.toString());
        formData.append("longitude", coordinates.lng.toString());
      }

      console.log("FormData entries:");
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || "Erro ao criar anúncio";
        } catch {
          errorMessage = errorText || "Erro ao criar anúncio";
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Success response:", result);
      return result;
    },
    onSuccess: async (data) => {
      console.log("Listing created successfully:", data);
      
      // Invalidate and refetch all listing queries
      await queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      await refetchListings();
      
      console.log("Queries invalidated and refetched");
      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu anúncio está agora disponível no marketplace",
      });
      form.reset({
        quantity: 1,
        weight: 0,
        pricePerHead: 0,
        description: "",
        city: "",
        sex: "" as "macho" | "femea",
        aptitude: "" as "corte" | "leite", 
        age: "" as "ate12" | "12a24" | "24a36" | "36a48" | "mais48",
      });
      setSelectedVideo(null);
      setCoordinates(null);
    },
    onError: (error: Error) => {
      console.error("=== LISTING ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      
      let errorMessage = "Erro desconhecido ao criar anúncio";
      
      if (error.message.includes("401") || error.message.includes("Authentication")) {
        errorMessage = "Sessão expirada. Redirecionando para login...";
        setTimeout(() => window.location.href = '/login', 1500);
      } else if (error.message.includes("400")) {
        errorMessage = "Dados inválidos no formulário. Verifique os campos obrigatórios.";
      } else if (error.message.includes("500")) {
        errorMessage = "Erro interno do servidor. Tente novamente.";
      } else {
        errorMessage = error.message || "Erro ao criar anúncio";
      }
      
      toast({
        title: "Erro ao criar anúncio",
        description: errorMessage,
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

  // Conditional returns AFTER all hooks
  if (userLoading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto"></div>
            <p className="text-white mt-4">Verificando autenticação...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!currentUser?.user && !isLocallyAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-white">Você precisa estar logado para acessar o marketplace.</p>
            <Button
              onClick={() => window.location.href = '/'}
              className="mt-4 bg-accent-green hover:bg-green-600 text-white"
            >
              Fazer Login
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

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
                    <Label className="text-white mb-3 block">Estado</Label>
                    <Select
                      value={filters.state || "todos"}
                      onValueChange={(value) => {
                        const stateVal = value === "todos" ? "" : value;
                        handleFilterChange("state", stateVal);
                        handleFilterChange("city", "");
                        if (stateVal) {
                          setAvailableCities(getCitiesByState(stateVal));
                        } else {
                          setAvailableCities([]);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-container-bg border-gray-600 text-white">
                        <SelectValue placeholder="Todos os estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os estados</SelectItem>
                        {brazilianStates.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">Cidade</Label>
                    <Select
                      value={filters.city || "todas"}
                      onValueChange={(value) => handleFilterChange("city", value === "todas" ? "" : value)}
                      disabled={!filters.state}
                    >
                      <SelectTrigger className="bg-container-bg border-gray-600 text-white">
                        <SelectValue placeholder={filters.state ? "Selecione a cidade" : "Selecione o estado primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as cidades</SelectItem>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto loading-pulse"></div>
                  <p className="text-secondary mt-4">Carregando anúncios...</p>
                </div>
              ) : listings?.listings?.length > 0 ? (
                listings.listings.map((listing: any) => (
                  <Card key={listing.id} className="card-enhanced bg-white text-gray-900 overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        {listing.videoUrl ? (
                          <div className="h-48 md:h-full bg-gray-200 relative">
                            <div className="absolute top-2 left-2 z-10">
                              <Badge className="bg-red-500 text-white">📹 VÍDEO</Badge>
                            </div>
                            <video 
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                              poster=""
                            >
                              <source src={listing.videoUrl} type="video/mp4" />
                              <source src={listing.videoUrl} type="video/mov" />
                              <source src={listing.videoUrl} type="video/avi" />
                              Seu navegador não suporta reprodução de vídeo.
                            </video>
                          </div>
                        ) : (
                          <div className="h-48 md:h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <div className="text-center">
                              <Eye className="h-12 w-12 text-green-500 mx-auto mb-2" />
                              <p className="text-green-700 font-medium">🐄 Bovinet</p>
                              <p className="text-green-600 text-sm">Foto em breve</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {listing.title ? listing.title : `Lote ${listing.id.toString().padStart(2, '0')}`}
                            </h3>
                            <p className="text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {listing.quantity} {listing.sex === "macho" ? "Machos" : "Fêmeas"} • {listing.city}, {listing.state || 'SP'}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 px-3 py-1">✅ Disponível</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Quantidade</p>
                            <p className="font-bold text-lg">{listing.quantity}</p>
                            <p className="text-xs text-gray-600">animais</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Sexo</p>
                            <p className="font-bold text-lg capitalize">{listing.sex}</p>
                            <p className="text-xs text-gray-600">{listing.sex === 'macho' ? '♂️' : '♀️'}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Idade</p>
                            <p className="font-bold text-sm">
                              {listing.age === 'ate12' ? 'até 12m' :
                               listing.age === '12a24' ? '12-24m' :
                               listing.age === '24a36' ? '24-36m' :
                               listing.age === '36a48' ? '36-48m' : '+48m'}
                            </p>
                            <p className="text-xs text-gray-600">meses</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Peso Médio</p>
                            <p className="font-bold text-lg">{listing.weight}</p>
                            <p className="text-xs text-gray-600">kg</p>
                          </div>
                        </div>

                        {listing.description && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4 border-l-4 border-blue-400">
                            <p className="text-sm text-gray-700">
                              <strong>📋 Descrição:</strong> {listing.description}
                            </p>
                          </div>
                        )}

                        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700">💰 Preço por cabeça:</span>
                            <span className="text-2xl font-bold text-green-600">
                              R$ {Number(listing.pricePerHead).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">📏 Preço por arroba:</span>
                            <span className="font-semibold text-green-700">
                              R$ {calculateArrobaPrice(Number(listing.pricePerHead), Number(listing.weight)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">🎯 Valor total do lote:</span>
                            <span className="font-bold text-green-800">
                              R$ {(Number(listing.pricePerHead) * listing.quantity).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>🏷️ Aptidão: <strong>{listing.aptitude}</strong></span>
                            <span>📅 {new Date(listing.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            className="btn-primary w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                            onClick={() => {
                              const message = `🐄 Olá! Vi seu anúncio no Bovinet:

📋 *${listing.title || `Lote ${listing.id.toString().padStart(2, '0')}`}*
📍 *Local:* ${listing.city}, ${listing.state || 'SP'}
🔢 *Quantidade:* ${listing.quantity} animais (${listing.sex})
💰 *Preço:* R$ ${Number(listing.pricePerHead).toLocaleString('pt-BR')}/cabeça
💵 *Total:* R$ ${(Number(listing.pricePerHead) * listing.quantity).toLocaleString('pt-BR')}

Tenho interesse! Podemos conversar?`;
                              const whatsappUrl = generateWhatsAppLink("5534991195042", message);
                              window.open(whatsappUrl, "_blank");
                            }}
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            💬 Tenho Interesse - WhatsApp
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
            <Card className="bg-container-bg border-gray-600 form-enhanced">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Anunciar Gado para Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit((data) => createListingMutation.mutate(data))} className="space-y-6">
                  
                  {/* Video Upload Section - Destacado */}
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                    <div className="text-center mb-4">
                      <Play className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-blue-800">📹 Vídeo dos Animais</h3>
                      <p className="text-blue-600 text-sm">Anúncios com vídeo vendem 3x mais rápido!</p>
                    </div>
                    
                    <VideoUpload 
                      onVideoSelect={setSelectedVideo}
                      selectedVideo={selectedVideo}
                    />
                    
                    <div className="mt-4 bg-blue-100 p-3 rounded border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para um bom vídeo:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Filme em local bem iluminado</li>
                        <li>• Mostre os animais em movimento</li>
                        <li>• Inclua diferentes ângulos</li>
                        <li>• Duração entre 30s e 2 minutos</li>
                      </ul>
                    </div>
                  </div>

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
                      <Label className="text-white flex items-center">
                        Quantidade de Animais *
                        <span className="ml-1 text-accent-red">•</span>
                      </Label>
                      <Input
                        {...form.register("quantity", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 50"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        min="1"
                        required
                      />
                      {form.formState.errors.quantity && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.quantity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white flex items-center">
                        Peso Médio (kg) *
                        <span className="ml-1 text-accent-red">•</span>
                      </Label>
                      <Input
                        {...form.register("weight", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 450"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        min="1"
                        required
                      />
                      {form.formState.errors.weight && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.weight.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-white flex items-center">
                        Preço por Cabeça (R$) *
                        <span className="ml-1 text-accent-red">•</span>
                      </Label>
                      <Input
                        {...form.register("pricePerHead", { valueAsNumber: true })}
                        type="number"
                        placeholder="Ex: 2500"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        min="1"
                        required
                      />
                      {form.formState.errors.pricePerHead && (
                        <p className="text-accent-red text-sm mt-1">
                          {form.formState.errors.pricePerHead.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {form.watch("pricePerHead") && form.watch("weight") ? 
                          `💰 Preço por arroba: R$ ${calculateArrobaPrice(form.watch("pricePerHead"), form.watch("weight")).toFixed(2)}` : 
                          "Digite peso e preço para ver valor por arroba"}
                      </p>
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
                    <Label className="text-white">Descrição detalhada *</Label>
                    <Textarea
                      {...form.register("description")}
                      rows={4}
                      placeholder="Descreva: raça, manejo, histórico sanitário, observações especiais..."
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green resize-none"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Inclua informações sobre raça, vacinação, origem e outras características importantes
                    </p>
                  </div>

                  <div className="bg-accent-green/10 border border-accent-green rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Play className="w-6 h-6 text-accent-green mr-2" />
                      <h3 className="text-white font-semibold text-lg">Vídeo dos Animais</h3>
                      <Badge className="ml-2 bg-red-500 text-white">RECOMENDADO</Badge>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Adicione um vídeo para aumentar as chances de venda em até 80%! 
                      Mostre os animais em movimento, aparência geral e comportamento.
                    </p>
                    <VideoUpload
                      onVideoSelect={setSelectedVideo}
                      selectedVideo={selectedVideo}
                    />
                    <div className="mt-3 text-sm text-gray-400">
                      <p>💡 Dicas para um bom vídeo:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Filme durante o dia com boa iluminação</li>
                        <li>Mostre os animais de diferentes ângulos</li>
                        <li>Inclua close-ups e visão geral do lote</li>
                        <li>Máximo 2 minutos de duração</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Estado *</Label>
                    <Select onValueChange={(value) => {
                      form.setValue("state", value);
                      // Atualizar cidades disponíveis
                      const cities = getCitiesByState(value);
                      setAvailableCities(cities);
                      // Limpar cidade se estado mudar
                      form.setValue("city", "");
                    }}>
                      <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilianStates.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.state && (
                      <p className="text-accent-red text-sm mt-1">
                        {form.formState.errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white">Cidade *</Label>
                    <Select 
                      onValueChange={(value) => form.setValue("city", value)}
                      disabled={!form.watch("state")}
                    >
                      <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                        <SelectValue placeholder={form.watch("state") ? "Selecione a cidade" : "Primeiro selecione o estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      className="btn-primary flex-1 bg-accent-green hover:bg-green-600 text-white"
                    >
                      {createListingMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publicando...
                        </div>
                      ) : (
                        "🚀 Publicar Anúncio"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            <div className="space-y-4">
              {userListings?.length > 0 ? (
                userListings.map((listing: any) => (
                  <Card key={listing.id} className="card-enhanced bg-container-bg border-gray-600">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {listing.title ? listing.title : `Lote ${listing.id.toString().padStart(2, '0')} - ${listing.city}`}
                          </h3>
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
