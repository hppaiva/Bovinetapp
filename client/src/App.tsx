import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import OfflineIndicator from "@/components/offline-indicator";
import AuthPage from "@/pages/auth";
import ResetPasswordPage from "@/pages/reset-password";
import AdminAdsPage from "@/pages/admin-ads";
import AdminListingsPage from "@/pages/admin-listings";
import { getAuthToken } from "@/lib/queryClient";

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

function ProtectedRoute({
  component: Component,
  isLoggedIn,
}: {
  component: React.ComponentType;
  isLoggedIn: boolean;
}) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth");
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;
  return <Component />;
}

function Router() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/admin/ads">
        <ProtectedRoute component={AdminAdsPage} isLoggedIn={isLoggedIn} />
      </Route>
      <Route path="/admin/listings">
        <ProtectedRoute component={AdminListingsPage} isLoggedIn={isLoggedIn} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

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
