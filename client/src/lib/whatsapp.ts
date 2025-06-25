export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Ensure the phone number starts with country code (55 for Brazil)
  let formattedPhone = cleanPhone;
  if (!formattedPhone.startsWith('55')) {
    formattedPhone = '55' + formattedPhone;
  }
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Generate WhatsApp link
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phoneNumber: string, message: string): void {
  const whatsappUrl = generateWhatsAppLink(phoneNumber, message);
  window.open(whatsappUrl, '_blank');
}
