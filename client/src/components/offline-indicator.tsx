import { useOffline } from '@/hooks/use-offline';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span>Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
      </div>
    </div>
  );
}