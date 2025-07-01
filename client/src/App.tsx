import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Marketplace from "@/pages/marketplace";
import Services from "@/pages/services";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import OfflineIndicator from "@/components/offline-indicator";
import AuthPage from "@/pages/auth";
import Freight from "@/pages/freight";
import RequestFreight from "@/pages/request-freight";

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
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/services" component={Services} />
          <Route path="/freight" component={Freight} />
          <Route path="/request-freight" component={RequestFreight} />
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
