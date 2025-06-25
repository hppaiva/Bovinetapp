import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getCurrentLocation } from "@/lib/geolocation";
import { MapPin, Crosshair, Check } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (coordinates: { lat: number; lng: number } | null) => void;
  coordinates: { lat: number; lng: number } | null;
}

export default function LocationPicker({ onLocationSelect, coordinates }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      onLocationSelect(coords);
      
      toast({
        title: "Localização capturada!",
        description: "Sua localização atual foi adicionada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro de localização",
        description: error.message || "Não foi possível obter sua localização",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocation = () => {
    onLocationSelect(null);
    toast({
      title: "Localização removida",
      description: "A localização foi removida do anúncio",
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-white">Localização dos Animais</Label>
      
      {coordinates ? (
        <Card className="bg-primary-bg border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Localização definida</p>
                  <p className="text-sm text-secondary">
                    Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearLocation}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Obtendo localização...
              </>
            ) : (
              <>
                <Crosshair className="h-4 w-4 mr-2" />
                Compartilhar Localização Atual
              </>
            )}
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
              <MapPin className="h-4 w-4" />
              <span>Sua localização não será compartilhada publicamente</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              A localização ajuda compradores a calcular custos de frete
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
