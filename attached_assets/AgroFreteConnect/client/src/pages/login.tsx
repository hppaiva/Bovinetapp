import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/ChatGPT Image 30 de jun. de 2025, 13_22_47_1751300800822.png";
import { Phone, MessageCircle, User, Truck } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"user" | "driver" | "">("");
  const [step, setStep] = useState<"userType" | "phone" | "code" | "waiting">("userType");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        return `${match[1] ? `(${match[1]}` : ""}${match[2] ? `) ${match[2]}` : ""}${match[3] ? `-${match[3]}` : ""}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const sendVerificationCode = async () => {
    setIsLoading(true);
    
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      // Código fixo para teste
      const code = "123456";
      setSentCode(code);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Seu%20código%20de%20verificação%20iFrete%20é:%20${code}%0A%0ANão%20compartilhe%20este%20código%20com%20ninguém.`;
      window.open(whatsappUrl, '_blank');
      
      setStep("code");
      toast({
        title: "Código enviado!",
        description: `Use o código de teste: 123456`,
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o código de verificação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    
    try {
      if (verificationCode !== sentCode) {
        toast({
          title: "Código inválido",
          description: "Verifique o código e tente novamente",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const cleanPhone = phone.replace(/\D/g, "");
      const userData = {
        phone: cleanPhone,
        userType: userType,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Login confirmado!",
        description: "Bem-vindo ao iFrete",
      });
      
      setLocation("/");
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o código",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === "userType" && userType) {
      setStep("phone");
    } else if (step === "phone" && phone.length >= 14) {
      sendVerificationCode();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
            <img 
              src={logoImg} 
              alt="iFrete Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">iFrete</h1>
          <p className="text-gray-600 text-sm">Frete inteligente</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === "userType" && "Como você vai usar o iFrete?"}
              {step === "phone" && "Seu WhatsApp"}
              {step === "waiting" && "Confirme no WhatsApp"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {step === "userType" && (
              <>
                <div className="space-y-3">
                  <Button
                    variant={userType === "user" ? "default" : "outline"}
                    onClick={() => setUserType("user")}
                    className="w-full h-16 flex items-center space-x-3"
                  >
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Usuário</p>
                      <p className="text-sm text-gray-500">Solicitar transporte</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant={userType === "driver" ? "default" : "outline"}
                    onClick={() => setUserType("driver")}
                    className="w-full h-16 flex items-center space-x-3"
                  >
                    <Truck className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Parceiro iFrete</p>
                      <p className="text-sm text-gray-500">Freteiro / Transportador</p>
                    </div>
                  </Button>
                </div>

                <Button 
                  onClick={handleContinue}
                  disabled={!userType || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Continuar
                </Button>

                {/* Link para cadastro de parceiro */}
                {userType === "driver" && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Ainda não é parceiro?</p>
                    <button
                      onClick={() => setLocation("/driver-registration")}
                      className="text-sm text-green-600 hover:text-green-700 underline font-medium"
                    >
                      Cadastre-se como Parceiro iFrete
                    </button>
                  </div>
                )}
              </>
            )}

            {step === "phone" && (
              <>
                <div className="space-y-3">
                  <Badge variant="secondary" className="w-full justify-center">
                    {userType === "user" ? "👤 Usuário" : "🚛 Parceiro iFrete"}
                  </Badge>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-2">
                      <MessageCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800">Verificação via WhatsApp</p>
                        <p className="text-green-600">Enviaremos um código de 6 dígitos</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={sendVerificationCode}
                  disabled={phone.length < 14 || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Enviando..." : "Enviar código WhatsApp"}
                </Button>
                
                <button
                  onClick={() => setStep("userType")}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Voltar
                </button>
              </>
            )}

            {step === "code" && (
              <>
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-full justify-center">
                    {userType === "user" ? "👤 Usuário" : "🚛 Parceiro iFrete"}
                  </Badge>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">Código enviado!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Digite o código de 6 dígitos enviado para <strong>{phone}</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                    />
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 text-center font-medium">
                        Código de teste: 123456
                      </p>
                      <p className="text-xs text-blue-600 text-center mt-1">
                        Não recebeu o código? Verifique seu WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={verifyCode}
                    disabled={verificationCode.length !== 6 || isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Verificando..." : "Confirmar código"}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setStep("phone")}
                      className="flex-1 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={sendVerificationCode}
                      disabled={isLoading}
                      className="flex-1 text-sm text-green-600 hover:text-green-700 underline"
                    >
                      Reenviar código
                    </button>
                  </div>
                </div>
              </>
            )}


          </CardContent>
        </Card>


      </div>
    </div>
  );
}