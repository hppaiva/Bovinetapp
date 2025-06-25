import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      city: "",
      state: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Bovinet",
      });
    },
    onError: () => {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada e você já está logado",
      });
    },
    onError: (error: Error) => {
      console.error("Register error:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });



  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Bovinet Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bovinet</h1>
          <p className="text-secondary">Plataforma de Negociação de Gado</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-container-bg">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary-bg"
            >
              Já tenho conta
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-container-bg data-[state=active]:text-white border border-gray-600"
            >
              Criar conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-center text-white">Entrar na sua conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label className="text-white">E-mail ou telefone</Label>
                    <Input
                      {...loginForm.register("email")}
                      type="email"
                      placeholder="Digite seu e-mail"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-accent-red text-sm mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        {...loginForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-accent-red text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-accent-green hover:bg-green-600 text-white"
                  >
                    {loginMutation.isPending ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-center text-white">Criar conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Input
                        {...registerForm.register("name")}
                        placeholder="Nome completo"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-accent-red text-sm mt-1">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        {...registerForm.register("cpf")}
                        placeholder="CPF"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.cpf && (
                        <p className="text-accent-red text-sm mt-1">
                          {registerForm.formState.errors.cpf.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        {...registerForm.register("phone")}
                        type="tel"
                        placeholder="Telefone"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-accent-red text-sm mt-1">
                          {registerForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        {...registerForm.register("email")}
                        type="email"
                        placeholder="E-mail"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-accent-red text-sm mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          {...registerForm.register("city")}
                          placeholder="Cidade"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {registerForm.formState.errors.city && (
                          <p className="text-accent-red text-sm mt-1">
                            {registerForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...registerForm.register("state")}
                          placeholder="Estado"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                        />
                        {registerForm.formState.errors.state && (
                          <p className="text-accent-red text-sm mt-1">
                            {registerForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Input
                          {...registerForm.register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha"
                          className="bg-primary-bg border-gray-600 text-white focus:border-accent-green pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-accent-red text-sm mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>



                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full bg-accent-green hover:bg-green-600 text-white"
                  >
                    {registerMutation.isPending ? "Criando Conta..." : "Criar Conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
