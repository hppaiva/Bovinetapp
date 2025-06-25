import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, ShoppingCart, Truck, FileText } from "lucide-react";

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Início",
      path: "/",
    },
    {
      icon: ShoppingCart,
      label: "Mercado",
      path: "/marketplace",
    },
    {
      icon: Truck,
      label: "Frete",
      path: "/freight",
    },
    {
      icon: FileText,
      label: "Serviços",
      path: "/services",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-container-bg border-t border-gray-600 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "flex flex-col items-center space-y-1 p-2 h-auto",
                active ? "text-accent-green" : "text-secondary hover:text-white"
              )}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
