import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleDashboard from "@/pages/simple-dashboard";
import Marketplace from "@/pages/marketplace";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import OfflineIndicator from "@/components/offline-indicator";
import AuthPage from "@/pages/auth";
import ResetPasswordPage from "@/pages/reset-password";
import AdminAdsPage from "@/pages/admin-ads";
import { getAuthToken } from "@/lib/queryClient";

// ─── Contexto de autenticação ───────────────────────────────────────────────
// FIX #1: estado de auth gerenciado via useState + useEffect,
// garantindo re-render correto no login/logout

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
}

function useAuth(): AuthState {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = getAuthToken();
    setIsLoggedIn(!!userData && !!token);
    setIsLoading(false);

    // FIX #1: escuta mudanças no localStorage para reagir a login/logout
    const handleStorage = () => {
      const updatedUser = localStorage.getItem("user");
      const updatedToken = getAuthToken();
      setIsLoggedIn(!!updatedUser && !!updatedToken);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { isLoggedIn, isLoading };
}

// ─── Rota protegida ──────────────────────────────────────────────────────────
// FIX #2: componente ProtectedRoute para proteger rotas autenticadas

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
  isLoggedIn: boolean;
}

function ProtectedRoute({ component: Component, path, isLoggedIn }: ProtectedRouteProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return <Route path={path} component={Component} />;
}

// ─── Roteador ────────────────────────────────────────────────────────────────
// FIX #3: Router não lê localStorage diretamente no render

function Router() {
  const { isLoggedIn, isLoading } = useAuth();

  // Evita flash de conteúdo incorreto enquanto verifica auth
  if (isLoading) return null;

  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      {/* FIX #4: NotFound só aparece para usuários logados nas rotas protegidas */}
      {!isLoggedIn ? (
        <Route component={AuthPage} />
      ) : (
        <>
          <ProtectedRoute path="/" component={SimpleDashboard} isLoggedIn={isLoggedIn} />
          <ProtectedRoute path="/dashboard" component={SimpleDashboard} isLoggedIn={isLoggedIn} />
          <ProtectedRoute path="/marketplace" component={Marketplace} isLoggedIn={isLoggedIn} />
          <ProtectedRoute path="/profile" component={Profile} isLoggedIn={isLoggedIn} />
          <ProtectedRoute path="/admin/ads" component={AdminAdsPage} isLoggedIn={isLoggedIn} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
