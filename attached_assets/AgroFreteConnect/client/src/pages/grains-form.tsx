import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { User } from "@shared/schema";

export default function GrainsForm() {
  const [grainType, setGrainType] = useState("soja");
  const [weight, setWeight] = useState("");
  const [origin, setOrigin] = useState("Armazém São Paulo, Matão/SP");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createFreightMutation = useMutation({
    mutationFn: async (freightData: any) => {
      const response = await apiRequest('POST', '/api/freights', freightData);
      return response.json();
    },
    onSuccess: async (freight) => {
      // Generate quotes for the freight
      await apiRequest('POST', `/api/freights/${freight.id}/generate-quotes`);
      setLocation(`/quote-screen/${freight.id}`);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar frete. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData = localStorage.getItem('current_user');
    if (!userData) {
      setLocation('/');
      return;
    }

    const user: User = JSON.parse(userData);
    const distance = calculateDistance(origin, destination);

    createFreightMutation.mutate({
      producerId: user.id,
      cargoType: "grains",
      animalType: grainType,
      quantity: parseInt(weight),
      weight: parseFloat(weight),
      origin,
      destination,
      distance: distance.toString(),
      notes,
    });
  };

  const grainTypes = [
    { id: "soja", label: "Soja", icon: "fa-wheat-awn" },
    { id: "milho", label: "Milho", icon: "fa-corn" },
    { id: "trigo", label: "Trigo", icon: "fa-wheat" },
    { id: "outros", label: "Outros", icon: "fa-seedling" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4 flex items-center">
        <Link href="/producer-dashboard">
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Frete de Grãos</h2>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grain Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Grão</Label>
            <div className="grid grid-cols-2 gap-3">
              {grainTypes.map((type) => (
                <Button
                  key={type.id}
                  type="button"
                  variant="outline"
                  onClick={() => setGrainType(type.id)}
                  className={`p-3 h-auto flex flex-col items-center border-2 transition-all ${
                    grainType === type.id
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <i className={`fas ${type.icon} text-yellow-500 text-xl mb-1`}></i>
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Weight */}
          <div>
            <Label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Peso Estimado (toneladas)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ex: 25"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          
          {/* Origin */}
          <div>
            <Label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
              Local de Origem
            </Label>
            <Input
              id="origin"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          
          {/* Destination */}
          <div>
            <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              Local de Destino
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="Porto de Santos/SP"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          
          {/* Additional Info */}
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Ex: Produto ensacado, carga seca..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={createFreightMutation.isPending}
            className="w-full bg-yellow-500 text-white font-semibold py-4 rounded-xl hover:bg-yellow-600 transition-colors"
          >
            {createFreightMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <i className="fas fa-calculator mr-2"></i>
            )}
            Cotar Frete
          </Button>
        </form>
      </div>
    </div>
  );
}
