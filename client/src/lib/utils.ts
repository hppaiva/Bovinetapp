import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateArrobaPrice(weightKg: number, pricePerHead: number): number {
  // 1 arroba = 30kg (Brazilian standard)
  const arrobas = weightKg / 30;
  return pricePerHead / arrobas;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'Agora há pouco';
  } else if (diffInHours < 24) {
    return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays === 1) {
    return 'Ontem';
  } else if (diffInDays < 7) {
    return `Há ${diffInDays} dias`;
  } else {
    return formatDate(dateObj);
  }
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string): string {
  const cleaned = sanitizePhone(phone);
  
  // Format Brazilian phone number
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

// Haversine distance between two coordinates in km
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Approximate coordinates for major Brazilian cities (cattle-region focused)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // São Paulo
  "são paulo": { lat: -23.5505, lng: -46.6333 },
  "barretos": { lat: -20.5572, lng: -48.5671 },
  "ribeirão preto": { lat: -21.1784, lng: -47.8101 },
  "campinas": { lat: -22.9056, lng: -47.0608 },
  "araçatuba": { lat: -21.2089, lng: -50.4326 },
  "presidente prudente": { lat: -22.1208, lng: -51.3881 },
  "marília": { lat: -22.2139, lng: -49.9457 },
  "botucatu": { lat: -22.886, lng: -48.4441 },
  "sorocaba": { lat: -23.5015, lng: -47.4526 },
  "são josé do rio preto": { lat: -20.8113, lng: -49.3758 },
  "franca": { lat: -20.5386, lng: -47.4008 },
  "andradina": { lat: -20.8964, lng: -51.3797 },
  "votuporanga": { lat: -20.4225, lng: -49.9718 },
  // Minas Gerais
  "uberaba": { lat: -19.7472, lng: -47.9381 },
  "uberlândia": { lat: -18.9186, lng: -48.2772 },
  "belo horizonte": { lat: -19.9167, lng: -43.9345 },
  "montes claros": { lat: -16.7286, lng: -43.8614 },
  "governador valadares": { lat: -18.8511, lng: -41.9497 },
  "juiz de fora": { lat: -21.7642, lng: -43.3503 },
  "patos de minas": { lat: -18.5789, lng: -46.5181 },
  "ituiutaba": { lat: -18.9714, lng: -49.4653 },
  "araguari": { lat: -18.6483, lng: -48.1858 },
  "três lagoas": { lat: -20.7517, lng: -51.6783 },
  "pará de minas": { lat: -19.8581, lng: -44.6092 },
  // Goiás
  "goiânia": { lat: -16.6869, lng: -49.2648 },
  "anápolis": { lat: -16.3281, lng: -48.9531 },
  "rio verde": { lat: -17.7983, lng: -50.9261 },
  "jataí": { lat: -17.8792, lng: -51.7156 },
  "catalão": { lat: -18.1661, lng: -47.9458 },
  "itumbiara": { lat: -18.4189, lng: -49.2158 },
  "morrinhos": { lat: -17.7342, lng: -49.1031 },
  "mineiros": { lat: -17.5675, lng: -52.5528 },
  "luziânia": { lat: -16.2528, lng: -47.9503 },
  "aparecida de goiânia": { lat: -16.8236, lng: -49.2444 },
  // Mato Grosso
  "cuiabá": { lat: -15.601, lng: -56.0974 },
  "rondonópolis": { lat: -16.4703, lng: -54.6358 },
  "sinop": { lat: -11.8642, lng: -55.5014 },
  "sorriso": { lat: -12.5458, lng: -55.7206 },
  "tangará da serra": { lat: -14.6194, lng: -57.5003 },
  "lucas do rio verde": { lat: -13.0561, lng: -55.9081 },
  "alta floresta": { lat: -9.8756, lng: -56.0861 },
  "primavera do leste": { lat: -15.5569, lng: -54.3008 },
  // Mato Grosso do Sul
  "campo grande": { lat: -20.4486, lng: -54.6295 },
  "dourados": { lat: -22.2211, lng: -54.8058 },
  "três lagoas": { lat: -20.7517, lng: -51.6783 },
  "corumbá": { lat: -19.0078, lng: -57.6531 },
  "ponta porã": { lat: -22.5361, lng: -55.7261 },
  "naviraí": { lat: -23.0636, lng: -54.1903 },
  "aquidauana": { lat: -20.4706, lng: -55.7869 },
  "coxim": { lat: -18.5061, lng: -54.7603 },
  // Paraná
  "cascavel": { lat: -24.9558, lng: -53.455 },
  "londrina": { lat: -23.3045, lng: -51.1696 },
  "maringá": { lat: -23.4273, lng: -51.9375 },
  "ponta grossa": { lat: -25.0945, lng: -50.1633 },
  "curitiba": { lat: -25.4284, lng: -49.2733 },
  "foz do iguaçu": { lat: -25.5163, lng: -54.5854 },
  // Pará
  "belém": { lat: -1.4558, lng: -48.4902 },
  "santarém": { lat: -2.4468, lng: -54.708 },
  "redenção": { lat: -8.0281, lng: -50.0322 },
  "paragominas": { lat: -2.9897, lng: -47.3483 },
  "marabá": { lat: -5.3686, lng: -49.1175 },
  "altamira": { lat: -3.2033, lng: -52.2061 },
  // Rondônia
  "porto velho": { lat: -8.7612, lng: -63.9039 },
  "ji-paraná": { lat: -10.8789, lng: -61.9453 },
  "ariquemes": { lat: -9.9133, lng: -63.0383 },
  // Tocantins
  "palmas": { lat: -10.2128, lng: -48.3603 },
  "araguaína": { lat: -7.1919, lng: -48.2044 },
  // Bahia
  "salvador": { lat: -12.9714, lng: -38.5014 },
  "feira de santana": { lat: -12.2664, lng: -38.9663 },
  "barreiras": { lat: -12.1547, lng: -45.0 },
  "luis eduardo magalhães": { lat: -12.0964, lng: -45.7897 },
  // Rio de Janeiro
  "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
  // Maranhão
  "são luís": { lat: -2.5297, lng: -44.3028 },
  "imperatriz": { lat: -5.5264, lng: -47.4919 },
  // Brasília
  "brasília": { lat: -15.7801, lng: -47.9292 },
};

export function getCityDistanceKm(
  cityName: string,
  userLat: number,
  userLng: number
): number | null {
  const key = cityName.toLowerCase().trim();
  const coords = CITY_COORDS[key];
  if (!coords) return null;
  return Math.round(haversineDistance(userLat, userLng, coords.lat, coords.lng));
}

export function formatWeight(weightKg: number): string {
  if (weightKg >= 1000) {
    return `${(weightKg / 1000).toFixed(1)}t`;
  }
  return `${weightKg}kg`;
}

export function getFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
