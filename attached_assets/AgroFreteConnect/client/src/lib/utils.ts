import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (11) 99999-9999
  if (digits.length >= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  } else if (digits.length >= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length >= 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  
  return digits;
}

export function calculateDistance(origin: string, destination: string): number {
  // Mock distance calculation - in real app would use Google Maps API
  const mockDistances: Record<string, Record<string, number>> = {
    "Ribeirão Preto": {
      "Barretos": 85,
      "São Carlos": 70,
      "Araraquara": 45,
      "Santos": 320,
    },
    "Araraquara": {
      "São Carlos": 25,
      "Ribeirão Preto": 45,
      "Barretos": 120,
    },
    "Matão": {
      "Ribeirão Preto": 45,
      "Santos": 280,
    }
  };

  // Extract city names from full addresses
  const originCity = origin.split(',')[0].split(' ').pop() || origin;
  const destCity = destination.split(',')[0].split(' ').pop() || destination;

  return mockDistances[originCity]?.[destCity] || 
         mockDistances[destCity]?.[originCity] || 
         Math.floor(Math.random() * 200) + 50; // Random fallback
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export function getAnimalIcon(animalType: string): string {
  const icons: Record<string, string> = {
    'bois': 'fa-cow',
    'bezerros': 'fa-baby',
    'novilhas': 'fa-cow',
    'outros': 'fa-horse',
  };
  
  return icons[animalType.toLowerCase()] || 'fa-cow';
}

export function getCargoIcon(cargoType: string): string {
  const icons: Record<string, string> = {
    'livestock': 'fa-cow',
    'grains': 'fa-wheat-awn',
    'machinery': 'fa-tractor',
  };
  
  return icons[cargoType] || 'fa-box';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'quoted': 'bg-blue-100 text-blue-800',
    'accepted': 'bg-green-100 text-green-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}
