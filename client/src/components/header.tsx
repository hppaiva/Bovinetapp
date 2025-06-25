import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Dog } from "lucide-react";

export default function Header() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-container-bg border-b border-gray-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Dog className="text-white text-lg w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Bovinet</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-primary-bg rounded-lg transition-colors relative"
            >
              <Bell className="text-white h-5 w-5" />
              {/* Notification badge - would be conditional based on actual notifications */}
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent-red text-white text-xs">
                2
              </Badge>
            </Button>
            
            <Button 
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-primary-bg p-2 rounded-lg transition-colors"
              onClick={() => window.location.href = "/profile"}
            >
              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.user?.name ? getInitials(user.user.name) : "U"}
                </span>
              </div>
              <span className="hidden sm:block text-white text-sm">
                {user?.user?.name || "Usuário"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
