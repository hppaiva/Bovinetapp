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

export default function LivestockForm() {
  const [animalType, setAnimalType] = useState("bois");
  const [quantity, setQuantity] = useState("");
  const [origin, setOrigin] = useState("Fazenda São José, Ribeirão Preto/SP");
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
      cargoType: "livestock",
      animalType,
      quantity: parseInt(quantity),
      origin,
      destination,
      distance: distance.toString(),
      notes,
    });
  };

  const animalTypes = [
    { id: "bois", label: "Bois", icon: "fa-cow" },
    { id: "bezerros", label: "Bezerros", icon: "fa-baby" },
    { id: "novilhas", label: "Novilhas", icon: "fa-cow" },
    { id: "outros", label: "Outros", icon: "fa-horse" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 flex items-center">
        <Link href="/producer-dashboard">
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Frete de Carga Viva</h2>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Animal Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Animal</Label>
            <div className="grid grid-cols-2 gap-3">
              {animalTypes.map((type) => (
                <Button
                  key={type.id}
                  type="button"
                  variant="outline"
                  onClick={() => setAnimalType(type.id)}
                  className={`p-3 h-auto flex flex-col items-center border-2 transition-all ${
                    animalType === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  <i className={`fas ${type.icon} text-orange-500 text-xl mb-1`}></i>
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Quantity */}
          <div>
            <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Animais
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ex: 18"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          {/* Origin */}
          <div>
            <Label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
              Local de Origem
            </Label>
            <div className="relative">
              <Input
                id="origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pr-10 focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-location-dot"></i>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fas fa-info-circle mr-1"></i>
              Localização atual detectada automaticamente
            </p>
          </div>
          
          {/* Destination */}
          <div>
            <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              Local de Destino
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="Digite o endereço de destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full focus:ring-orange-500 focus:border-orange-500"
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
              placeholder="Ex: Animais mansos, carga urgente..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={createFreightMutation.isPending}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors"
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
