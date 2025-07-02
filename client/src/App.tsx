import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleDashboard from "@/pages/simple-dashboard";
import Marketplace from "@/pages/marketplace";
import Services from "@/pages/services";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import OfflineIndicator from "@/components/offline-indicator";
import AuthPage from "@/pages/auth";

function Router() {
  // Sistema de autenticação restaurado do dia 27
  const userData = localStorage.getItem('user');
  const isLoggedIn = !!userData;

  return (
    <Switch>
      {!isLoggedIn ? (
        <>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={SimpleDashboard} />
          <Route path="/dashboard" component={SimpleDashboard} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/services" component={Services} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </>
      )}
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
