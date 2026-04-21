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
import { apiRequest, getAuthToken } from "@/lib/queryClient";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { calculateArrobaPrice, getCityDistanceKm } from "@/lib/utils";
import AdBanner from "@/components/ad-banner";
import { brazilianStates, getCitiesByState } from "../data/brazilian-locations";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import VideoUpload from "@/components/video-upload";
import LocationPicker from "@/components/location-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, List, MapPin, MessageCircle, Play, Eye, Gavel, TrendingUp } from "lucide-react";

const listingSchema = z.object({
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  sex: z.enum(["macho", "femea"], { required_error: "Sexo é obrigatório" }),
  age: z.enum(["ate12", "12a24", "24a36", "36a48", "mais48"], { required_error: "Idade é obrigatória" }),
  weight: z.number().min(1, "Peso deve ser maior que 0"),
  pricePerHead: z.number().min(1, "Preço deve ser maior que 0"),
  aptitude: z.enum(["corte", "leite"], { required_error: "Aptidão é obrigatória" }),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "buy";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filters, setFilters] = useState({
    sex: "all",
    aptitude: "all",
    age: "all",
    distance: 200,
    city: "",
  });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [bidListing, setBidListing] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Detect expired session: API returned null but localStorage has stale data → clear and redirect to login
  useEffect(() => {
    if (!userLoading && !user) {
      const token = getAuthToken();
      const localData = localStorage.getItem('user');
      if (!token && localData) {
        // Stale local data with no token — clear and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    }
  }, [user, userLoading]);

  // Check localStorage auth as fallback (computed before hooks that depend on it)
  const localAuth = localStorage.getItem('user');
  const isLocallyAuthenticated = !!localAuth && !!getAuthToken();
  let currentUser: any = user;
  if (!currentUser?.user && isLocallyAuthenticated) {
    try {
      const userData = JSON.parse(localAuth!);
      currentUser = { user: userData };
    } catch (e) {
      // ignore parse errors
    }
  }

  // Function to get user geolocation
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS não disponível", description: "Seu navegador não suporta geolocalização.", variant: "destructive" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setLocationLoading(false);
        toast({ title: "📍 Localização ativada!", description: "Buscando anúncios perto de você." });
      },
      (error) => {
        setLocationLoading(false);
        const msg = error.code === 1 ? "Permissão negada. Ative o GPS nas configurações do navegador." :
                    error.code === 2 ? "Não foi possível determinar sua localização." :
                    "Tempo esgotado. Tente novamente.";
        toast({ title: "Erro de localização", description: msg, variant: "destructive" });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // All queries/hooks must come before any conditional return
  const { data: listings, isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ["/api/listings", filters, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sex && filters.sex !== "all") params.append("sex", filters.sex);
      if (filters.aptitude && filters.aptitude !== "all") params.append("aptitude", filters.aptitude);
      if (filters.age && filters.age !== "all") params.append("age", filters.age);
      if (filters.city) params.append("city", filters.city);
      if (userLocation) {
        params.append("userLat", userLocation.lat.toString());
        params.append("userLon", userLocation.lng.toString());
        params.append("maxDistance", filters.distance.toString());
      }

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
      const token = getAuthToken();
      const response = await fetch("/api/listings/user", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return { listings: [] };
      return response.json();
    },
  });

  const { data: bidsData, refetch: refetchBids } = useQuery({
    queryKey: ["/api/listings", bidListing?.id, "bids"],
    enabled: !!bidListing?.id,
    queryFn: async () => {
      const response = await fetch(`/api/listings/${bidListing.id}/bids`, { credentials: "include" });
      if (!response.ok) return { bids: [] };
      return response.json();
    },
  });

  const createBidMutation = useMutation({
    mutationFn: async ({ listingId, amount }: { listingId: number; amount: number }) => {
      const token = getAuthToken();
      const response = await fetch(`/api/listings/${listingId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao registrar lance");
      return data;
    },
    onSuccess: () => {
      toast({ title: "Lance registrado!", description: "Seu lance foi registrado com sucesso." });
      setBidAmount("");
      refetchBids();
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const { data: sellerBidsData, refetch: refetchSellerBids } = useQuery({
    queryKey: ["/api/seller/bids"],
    enabled: !!(currentUser?.user?.id || isLocallyAuthenticated),
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/seller/bids", {
        credentials: "include",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!response.ok) return { bids: [] };
      return response.json();
    },
  });

  const updateBidStatusMutation = useMutation({
    mutationFn: async ({ listingId, bidId, status }: { listingId: number; bidId: number; status: string }) => {
      const token = getAuthToken();
      const response = await fetch(`/api/listings/${listingId}/bids/${bidId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao atualizar proposta");
      return data;
    },
    onSuccess: (_, variables) => {
      const msg = variables.status === "accepted" ? "Proposta aceita! O anúncio foi desativado." : "Proposta recusada.";
      toast({ title: variables.status === "accepted" ? "✅ Proposta aceita!" : "Proposta recusada", description: msg });
      refetchSellerBids();
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
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

      const token = getAuthToken();
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const handleFilterChange = (type: string, value: string | number) => {
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
            {/* Top sponsored banner */}
            <AdBanner position="top_banner" />

            {/* Filters */}
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Buscar Animais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Location: GPS or City */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold">Localização</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={userLocation ? () => setUserLocation(null) : getUserLocation}
                      disabled={locationLoading}
                      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 ${userLocation ? "bg-green-600 hover:bg-red-600" : "bg-accent-green hover:bg-green-600"} text-white`}
                    >
                      {locationLoading ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> GPS...</>
                      ) : userLocation ? (
                        <><MapPin className="w-4 h-4" /> Localização Ativa</>
                      ) : (
                        <><MapPin className="w-4 h-4" /> Usar GPS</>
                      )}
                    </Button>
                    {!userLocation && (
                      <Input
                        placeholder="Ou digite a cidade..."
                        value={filters.city}
                        onChange={(e) => handleFilterChange("city", e.target.value)}
                        className="bg-primary-bg border-gray-600 text-white flex-1"
                      />
                    )}
                  </div>
                  {userLocation && (
                    <p className="text-green-400 text-sm">
                      📍 GPS ativo — mostrando anúncios no raio de {filters.distance} km
                    </p>
                  )}
                </div>

                {/* Sex */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold">Sexo</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "Todos" },
                      { value: "macho", label: "Macho" },
                      { value: "femea", label: "Fêmea" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleFilterChange("sex", opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          filters.sex === opt.value
                            ? "bg-accent-green border-accent-green text-white"
                            : "bg-primary-bg border-gray-600 text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aptitude */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold">Aptidão</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "Todos" },
                      { value: "corte", label: "Corte" },
                      { value: "leite", label: "Leite" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleFilterChange("aptitude", opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          filters.aptitude === opt.value
                            ? "bg-accent-green border-accent-green text-white"
                            : "bg-primary-bg border-gray-600 text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold">Idade</Label>
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

                {/* Distance — only shown when GPS active */}
                {userLocation && (
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">
                      Raio de distância: {filters.distance} km
                    </Label>
                    <Slider
                      value={[filters.distance]}
                      onValueChange={(value) => handleFilterChange("distance", value[0])}
                      max={500}
                      min={10}
                      step={10}
                      className="w-full [&_.bg-primary]:bg-accent-green [&_[role=slider]]:border-accent-green [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-lg"
                    />
                    <div className="flex justify-between text-xs text-secondary">
                      <span>10 km</span>
                      <span>500 km</span>
                    </div>
                  </div>
                )}

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
                            {userLocation && (() => {
                              const dist = listing.latitude && listing.longitude
                                ? Math.round(Math.sqrt(
                                    Math.pow((Number(listing.latitude) - userLocation.lat) * 111, 2) +
                                    Math.pow((Number(listing.longitude) - userLocation.lng) * 111, 2)
                                  ))
                                : getCityDistanceKm(listing.city, userLocation.lat, userLocation.lng);
                              return dist !== null ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                                  🚗 ~{dist.toLocaleString('pt-BR')} km de você
                                </span>
                              ) : null;
                            })()}
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
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">📏 Preço por arroba (@):</span>
                            <span className="font-semibold text-green-700">
                              R$ {calculateArrobaPrice(Number(listing.weight), Number(listing.pricePerHead)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">⚖️ Preço por kg:</span>
                            <span className="font-semibold text-green-700">
                              R$ {Number(listing.weight) > 0
                                ? (Number(listing.pricePerHead) / Number(listing.weight)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : "—"}
                              /kg
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
                            className="btn-primary w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3"
                            onClick={() => {
                              setBidListing(listing);
                              setBidAmount("");
                            }}
                          >
                            <Gavel className="w-5 h-5 mr-2" />
                            🔨 Ofertar Lance
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
                <form onSubmit={form.handleSubmit((data) => {
                  if (!coordinates && !data.city) {
                    toast({ title: "Localização necessária", description: "Informe a cidade ou use sua localização atual.", variant: "destructive" });
                    return;
                  }
                  createListingMutation.mutate(data);
                })} className="space-y-6">
                  
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
                          `💰 Preço por arroba: R$ ${calculateArrobaPrice(form.watch("weight"), form.watch("pricePerHead")).toFixed(2)} | R$ ${(form.watch("pricePerHead") / form.watch("weight")).toFixed(2)}/kg` : 
                          "Digite peso e preço para ver valor por arroba e por kg"}
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
                    <LocationPicker
                      onLocationSelect={setCoordinates}
                      coordinates={coordinates}
                    />
                  </div>

                  {!coordinates && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>Ou informe a localização manualmente:</span>
                      </div>
                      <div>
                        <Label className="text-white">Estado {!coordinates && "*"}</Label>
                        <Select onValueChange={(value) => {
                          form.setValue("state", value);
                          const cities = getCitiesByState(value);
                          setAvailableCities(cities);
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
                      </div>

                      <div>
                        <Label className="text-white">Cidade {!coordinates && "*"}</Label>
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
                      </div>
                    </div>
                  )}



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
            <div className="space-y-6">
              {/* Bids / Proposals Section */}
              {sellerBidsData?.bids?.length > 0 && (
                <Card className="bg-container-bg border-amber-600/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <span className="text-amber-400">📨</span>
                      Propostas Recebidas
                      <Badge className="bg-amber-600 text-white ml-2">
                        {sellerBidsData.bids.filter((b: any) => b.status === "pending").length} pendentes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sellerBidsData.bids.map((bid: any) => (
                      <div
                        key={bid.id}
                        className={`p-4 rounded-lg border ${
                          bid.status === "accepted"
                            ? "bg-green-900/30 border-green-600"
                            : bid.status === "rejected"
                            ? "bg-gray-800/50 border-gray-600 opacity-60"
                            : "bg-primary-bg border-amber-600/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1 truncate">{bid.listingTitle}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-white font-bold text-lg">
                                R$ {Number(bid.amount).toLocaleString('pt-BR')}
                                <span className="text-gray-400 text-sm font-normal">/cab</span>
                              </span>
                              <span className="text-gray-300 text-sm">
                                {bid.bidderInitial}*** — {new Date(bid.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                              {bid.status === "accepted" && (
                                <Badge className="bg-green-600 text-white text-xs">✅ Aceita</Badge>
                              )}
                              {bid.status === "rejected" && (
                                <Badge className="bg-gray-600 text-white text-xs">Recusada</Badge>
                              )}
                            </div>
                          </div>
                          {bid.status === "pending" && (
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                                disabled={updateBidStatusMutation.isPending}
                                onClick={() => updateBidStatusMutation.mutate({
                                  listingId: bid.listingId,
                                  bidId: bid.id,
                                  status: "accepted",
                                })}
                              >
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/30 text-xs px-3"
                                disabled={updateBidStatusMutation.isPending}
                                onClick={() => updateBidStatusMutation.mutate({
                                  listingId: bid.listingId,
                                  bidId: bid.id,
                                  status: "rejected",
                                })}
                              >
                                Recusar
                              </Button>
                            </div>
                          )}
                          {bid.status === "accepted" && bid.bidderPhone && (
                            <a
                              href={`https://wa.me/55${bid.bidderPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Aceitei sua proposta de R$ ${Number(bid.amount).toLocaleString('pt-BR')}/cab para ${bid.listingTitle}. Vamos combinar os detalhes?`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs px-3">
                                📱 WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Listings */}
              {userListings?.listings?.length > 0 ? (
                userListings.listings.map((listing: any) => {
                  const listingBids = sellerBidsData?.bids?.filter((b: any) => b.listingId === listing.id) || [];
                  const pendingCount = listingBids.filter((b: any) => b.status === "pending").length;
                  return (
                    <Card key={listing.id} className="card-enhanced bg-container-bg border-gray-600">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-semibold text-white">
                              {listing.title || `Lote ${listing.id.toString().padStart(2, '0')}`}
                            </h3>
                            <p className="text-secondary text-sm">
                              Publicado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {pendingCount > 0 && (
                              <Badge className="bg-amber-600 text-white text-xs">
                                {pendingCount} proposta{pendingCount > 1 ? "s" : ""}
                              </Badge>
                            )}
                            <Badge className={listing.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}>
                              {listing.isActive ? "Ativo" : "Encerrado"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-secondary">Quantidade</p>
                            <p className="font-semibold text-white">{listing.quantity} animais</p>
                          </div>
                          <div>
                            <p className="text-secondary">Preço pedido</p>
                            <p className="font-semibold text-white">
                              R$ {Number(listing.pricePerHead).toLocaleString('pt-BR')}/cab
                            </p>
                          </div>
                          <div>
                            <p className="text-secondary">Propostas</p>
                            <p className="font-semibold text-white">{listingBids.length} total</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
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

      {/* Bid Dialog — outside Tabs to avoid Radix UI children conflict */}
      <Dialog open={!!bidListing} onOpenChange={(open) => { if (!open) setBidListing(null); }}>
        <DialogContent className="bg-container-bg border-gray-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400" />
              Ofertar Lance — {bidListing?.title || `Lote ${bidListing?.id?.toString().padStart(2, '0')}`}
            </DialogTitle>
          </DialogHeader>

          {/* Price reference */}
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">Lance inicial (preço tabela):</span>
              <span className="font-bold text-green-400">R$ {Number(bidListing?.pricePerHead || 0).toLocaleString('pt-BR')}/cab</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Preço por arroba (@):</span>
              <span className="font-semibold text-green-300">
                R$ {bidListing ? calculateArrobaPrice(Number(bidListing.weight), Number(bidListing.pricePerHead)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Preço por kg:</span>
              <span className="font-semibold text-green-300">
                R$ {bidListing && Number(bidListing.weight) > 0 ? (Number(bidListing.pricePerHead) / Number(bidListing.weight)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}/kg
              </span>
            </div>
          </div>

          {/* Current bids */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Lances atuais {bidsData?.bids?.length > 0 ? `(${bidsData.bids.length})` : ""}
            </h4>
            {bidsData?.bids?.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {bidsData.bids.map((bid: any, idx: number) => (
                  <div key={bid.id} className={`flex justify-between items-center p-2 rounded ${idx === 0 ? "bg-amber-900/50 border border-amber-600" : "bg-gray-800/50"}`}>
                    <span className="text-gray-300 text-sm">
                      {idx === 0 && "🏆 "}{bid.bidderInitial}***
                    </span>
                    <span className={`font-bold ${idx === 0 ? "text-amber-400" : "text-gray-300"}`}>
                      R$ {Number(bid.amount).toLocaleString('pt-BR')}
                      {idx === 0 && <span className="text-xs ml-1 text-amber-300">— maior lance</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Nenhum lance ainda. Seja o primeiro!</p>
            )}
          </div>

          {/* Bid form */}
          <div className="space-y-3">
            <Label className="text-white">Seu lance por cabeça (R$)</Label>
            <Input
              type="number"
              placeholder="Ex: 3500"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-primary-bg border-gray-600 text-white text-lg"
              min={1}
            />
            {bidAmount && Number(bidAmount) > 0 && bidListing && (
              <div className="text-xs text-gray-400 space-y-1">
                <div>Arroba: R$ {calculateArrobaPrice(Number(bidListing.weight), Number(bidAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div>Total do lote: R$ {(Number(bidAmount) * bidListing.quantity).toLocaleString('pt-BR')}</div>
              </div>
            )}
            <Button
              onClick={() => {
                if (!bidAmount || Number(bidAmount) <= 0) {
                  toast({ title: "Valor inválido", description: "Digite um valor de lance maior que zero.", variant: "destructive" });
                  return;
                }
                createBidMutation.mutate({ listingId: bidListing.id, amount: Number(bidAmount) });
              }}
              disabled={createBidMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
            >
              <Gavel className="w-5 h-5 mr-2" />
              {createBidMutation.isPending ? "Registrando..." : "Confirmar Lance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
