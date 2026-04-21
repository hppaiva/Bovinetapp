import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      if (!supabase) {
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setReady(true);
    })();
  }, []);

  const onSubmit = async (values: ResetForm) => {
    setSubmitting(true);
    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error("Supabase indisponível");
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) throw new Error(error.message);
      await supabase.auth.signOut();
      toast({
        title: "Senha redefinida",
        description: "Use sua nova senha para entrar.",
      });
      navigate("/auth");
    } catch (err: any) {
      toast({
        title: "Erro ao redefinir",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-container-bg border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Redefinir senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasSession ? (
              <div className="text-center space-y-4">
                <p className="text-secondary">
                  Link inválido ou expirado. Solicite um novo e-mail de
                  redefinição.
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-accent-green hover:bg-green-600 text-white"
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="password" className="text-white">
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Input
                      {...form.register("password")}
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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-accent-red text-sm mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar nova senha
                  </Label>
                  <Input
                    {...form.register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="bg-primary-bg border-gray-600 text-white focus:border-accent-green"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-accent-red text-sm mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent-green hover:bg-green-600 text-white text-lg py-3"
                >
                  {submitting ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
