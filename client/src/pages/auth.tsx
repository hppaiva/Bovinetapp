import { useState, useEffect } from "react";
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
import { setAuthToken } from "@/lib/queryClient";
import { getSupabase } from "@/lib/supabase";
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

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const queryClient = useQueryClient();

  // Pre-load Supabase client on mount
  useEffect(() => {
    getSupabase().then((client) => {
      setSupabaseReady(!!client);
    });
  }, []);

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
      const supabase = await getSupabase();

      if (supabase) {
        // Supabase Auth login
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          // Check if it might be a legacy user (exists in our DB but not in Supabase)
          // Fall back to custom auth
          const legacyRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
          });
          if (!legacyRes.ok) {
            const errData = await legacyRes.json().catch(() => ({}));
            throw new Error(errData.message || "E-mail ou senha incorretos");
          }
          return legacyRes.json();
        }

        // Supabase login succeeded — sync with our backend
        const token = authData.session!.access_token;
        let syncRes = await fetch("/api/auth/supabase-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token }),
          credentials: "include",
        });

        // If profile doesn't exist yet, try to create it with pending data
        if (syncRes.status === 404) {
          const pending = sessionStorage.getItem("pendingProfile");
          if (pending) {
            const profile = JSON.parse(pending);
            const regRes = await fetch("/api/auth/supabase-register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken: token, ...profile }),
              credentials: "include",
            });
            if (regRes.ok) {
              sessionStorage.removeItem("pendingProfile");
              const result = await regRes.json();
              return { ...result, token };
            }
          }
          throw new Error("Perfil não encontrado. Complete seu cadastro primeiro.");
        }

        if (!syncRes.ok) {
          const errData = await syncRes.json().catch(() => ({}));
          throw new Error(errData.message || "Erro ao sincronizar conta");
        }

        const result = await syncRes.json();
        // Use Supabase token as our auth token
        return { ...result, token };
      } else {
        // Supabase not available — use legacy custom auth
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "E-mail ou senha incorretos");
        }
        return res.json();
      }
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao Bovinet!",
      });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message || "E-mail ou senha incorretos",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const supabase = await getSupabase();

      if (supabase) {
        // 1) Create user in Supabase Auth
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) {
          throw new Error(error.message || "Erro ao criar conta no Supabase");
        }

        const token = authData.session?.access_token;
        if (!token) {
          // Email confirmation required by Supabase
          // Save profile data so we can complete registration after confirmation
          sessionStorage.setItem(
            "pendingProfile",
            JSON.stringify({
              name: data.name,
              phone: data.phone,
              cpf: data.cpf,
              city: data.city,
              state: data.state,
              email: data.email,
            })
          );
          throw new Error(
            "📧 Confirmação de e-mail necessária! Verifique sua caixa de entrada e clique no link enviado pelo Supabase. Depois faça login normalmente."
          );
        }

        // 2) Create user profile in our backend
        const syncRes = await fetch("/api/auth/supabase-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: token,
            name: data.name,
            phone: data.phone,
            cpf: data.cpf,
            city: data.city,
            state: data.state,
          }),
          credentials: "include",
        });

        if (!syncRes.ok) {
          const errData = await syncRes.json().catch(() => ({}));
          throw new Error(errData.message || "Erro ao criar perfil");
        }

        const result = await syncRes.json();
        return { ...result, token };
      } else {
        // Supabase not available — use legacy custom register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Erro ao criar conta");
        }
        return res.json();
      }
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      toast({
        title: "Conta criada",
        description: "Sua conta foi criada com sucesso!",
      });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="bg-primary-bg min-h-screen">
      <div className="max-w-md mx-auto px-6 py-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Bovinet"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bovinet</h1>
          <p className="text-secondary">Sua plataforma de negociação de gado</p>
        </div>

        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-container-bg border-gray-600">
            <TabsTrigger value="login" className="data-[state=active]:bg-accent-green data-[state=active]:text-white">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-accent-green data-[state=active]:text-white">
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-container-bg border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-center">Entre na sua conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">E-mail</Label>
                    <Input
                      {...loginForm.register("email")}
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-accent-red text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        {...loginForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-accent-red text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-accent-green hover:bg-green-600 text-white text-lg py-3"
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
                <CardTitle className="text-white text-center">Criar conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome completo</Label>
                    <Input
                      {...registerForm.register("name")}
                      placeholder="Seu nome completo"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">E-mail</Label>
                    <Input
                      {...registerForm.register("email")}
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-white">Telefone</Label>
                      <Input
                        {...registerForm.register("phone")}
                        placeholder="(11) 99999-9999"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cpf" className="text-white">CPF</Label>
                      <Input
                        {...registerForm.register("cpf")}
                        placeholder="000.000.000-00"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.cpf && (
                        <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.cpf.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-white">Cidade</Label>
                      <Input
                        {...registerForm.register("city")}
                        placeholder="Sua cidade"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.city && (
                        <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-white">Estado</Label>
                      <Input
                        {...registerForm.register("state")}
                        placeholder="UF"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                      />
                      {registerForm.formState.errors.state && (
                        <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        {...registerForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="bg-primary-bg border-gray-600 text-white focus:border-accent-green pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-accent-red text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full bg-accent-green hover:bg-green-600 text-white text-lg py-3"
                  >
                    {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-secondary text-sm">
          <p>Ao criar uma conta, você concorda com nossos</p>
          <p>Termos de Uso e Política de Privacidade</p>
        </div>
      </div>
    </div>
  );
}
