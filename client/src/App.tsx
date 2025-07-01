import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Marketplace from "@/pages/marketplace";
import Freight from "@/pages/freight";
import RequestFreight from "@/pages/request-freight";
import DriverDashboard from "@/pages/driver-dashboard";
import Services from "@/pages/services";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import OfflineIndicator from "@/components/offline-indicator";
import AuthGuard from "@/components/auth-guard";

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/freight" component={Freight} />
        <Route path="/request-freight" component={RequestFreight} />
        <Route path="/driver-dashboard" component={DriverDashboard} />
        <Route path="/services" component={Services} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
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
