import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a phone number in localStorage
    const phone = localStorage.getItem('registering_phone');
    if (!phone) {
      setLocation('/phone-registration');
    }
  }, [setLocation]);

  const createUserMutation = useMutation({
    mutationFn: async (role: string) => {
      const phone = localStorage.getItem('registering_phone');
      if (!phone) throw new Error('No phone number found');

      const response = await apiRequest('POST', '/api/users', {
        phone,
        role,
        name: role === 'producer' ? 'Produtor' : 'Freteiro',
        location: 'São Paulo/SP',
      });

      const user = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem('current_user', JSON.stringify(user));
      localStorage.removeItem('registering_phone');
      
      return user;
    },
    onSuccess: (user) => {
      if (user.role === 'producer') {
        setLocation('/producer-dashboard');
      } else if (user.role === 'driver') {
        setLocation('/driver-dashboard');
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-whatsapp text-white p-4 flex items-center">
        <Link href="/phone-registration">
          <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-white/20">
            <i className="fas fa-arrow-left text-xl"></i>
          </Button>
        </Link>
        <h2 className="text-lg font-semibold">Escolha seu perfil</h2>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Como você vai usar o iFrete?</h3>
          <p className="text-gray-600 text-sm">Selecione a opção que melhor te representa</p>
        </div>
        
        <div className="space-y-4">
          {/* Producer Option */}
          <Button
            variant="outline"
            onClick={() => createUserMutation.mutate('producer')}
            disabled={createUserMutation.isPending}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-whatsapp hover:bg-whatsapp/5 transition-all h-auto"
          >
            <div className="flex items-center w-full">
              <div className="bg-green-100 rounded-full p-4 mr-4">
                <i className="fas fa-seedling text-green-600 text-2xl"></i>
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-800">Sou Produtor Rural</h4>
                <p className="text-gray-600 text-sm">Preciso de frete para animais, grãos ou máquinas</p>
              </div>
              <i className="fas fa-chevron-right text-gray-400 ml-auto"></i>
            </div>
          </Button>
          
          {/* Driver Option */}
          <Button
            variant="outline"
            onClick={() => createUserMutation.mutate('driver')}
            disabled={createUserMutation.isPending}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-whatsapp hover:bg-whatsapp/5 transition-all h-auto"
          >
            <div className="flex items-center w-full">
              <div className="bg-blue-100 rounded-full p-4 mr-4">
                <i className="fas fa-truck text-blue-600 text-2xl"></i>
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-800">Sou Freteiro</h4>
                <p className="text-gray-600 text-sm">Quero encontrar cargas disponíveis</p>
              </div>
              <i className="fas fa-chevron-right text-gray-400 ml-auto"></i>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
