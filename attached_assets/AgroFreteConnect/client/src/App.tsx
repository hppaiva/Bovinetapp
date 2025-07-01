import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import RoleSelection from "@/pages/role-selection";
import RequestTransport from "@/pages/request-transport";
import Tracking from "@/pages/tracking";
import ProducerDashboard from "@/pages/producer-dashboard";
import LivestockForm from "@/pages/livestock-form";
import GrainsForm from "@/pages/grains-form";
import QuoteScreen from "@/pages/quote-screen";
import BookingConfirmation from "@/pages/booking-confirmation";
import TrackingScreen from "@/pages/tracking-screen";
import DriverDashboard from "@/pages/driver-dashboard";
import DriverTracking from "@/pages/driver-tracking";
import DriverRegistration from "@/pages/driver-registration";

function Router() {
  // Verificar se o usuário está logado
  const userData = localStorage.getItem('user');
  const isLoggedIn = !!userData;

  return (
    <Switch>
      {!isLoggedIn ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/role-selection" component={RoleSelection} />
          <Route path="/driver-registration" component={DriverRegistration} />
          <Route component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/request-transport" component={RequestTransport} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/producer-dashboard" component={ProducerDashboard} />
          <Route path="/livestock-form" component={LivestockForm} />
          <Route path="/grains-form" component={GrainsForm} />
          <Route path="/quote-screen/:freightId" component={QuoteScreen} />
          <Route path="/booking-confirmation/:bookingId" component={BookingConfirmation} />
          <Route path="/tracking-screen/:bookingId" component={TrackingScreen} />
          <Route path="/driver-dashboard" component={DriverDashboard} />
          <Route path="/driver-tracking/:bookingId" component={DriverTracking} />
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
        <div className="app-container">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
