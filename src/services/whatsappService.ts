import { Linking } from 'react-native';
import { CartItem } from '../types';

// Tu número de WhatsApp (reemplaza con tu número real)
const WHATSAPP_NUMBER = '573001234567'; // Formato: código país + número sin espacios ni símbolos

interface OrderData {
  cartItems: CartItem[];
  total: number;
  deliveryAddress: {
    address: string;
    additionalInfo: string;
  };
  paymentMethod: string;
}

export const whatsappService = {
  formatOrderMessage(orderData: OrderData): string {
    const { cartItems, total, deliveryAddress, paymentMethod } = orderData;
    
    let message = '🛒 *NUEVO PEDIDO - CAFETERÍA*\n\n';
    
    // Información del pedido
    message += '📋 *PRODUCTOS:*\n';
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   • Presentación: ${item.pack}\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio unitario: $${item.price.toFixed(2)}\n`;
      message += `   • Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    // Total
    message += `💰 *TOTAL: $${total.toFixed(2)}*\n\n`;
    
    // Dirección de entrega
    message += '📍 *DIRECCIÓN DE ENTREGA:*\n';
    message += `${deliveryAddress.address}\n`;
    if (deliveryAddress.additionalInfo.trim()) {
      message += `Información adicional: ${deliveryAddress.additionalInfo}\n`;
    }
    message += '\n';
    
    // Método de pago
    message += '💳 *MÉTODO DE PAGO:*\n';
    message += paymentMethod === 'qr' ? '📱 Pago con QR' : 
               paymentMethod === 'card' ? '💳 Tarjeta de crédito' : 
               '📱 WhatsApp';
    message += '\n\n';
    
    // Información adicional
    message += '⏰ *Fecha del pedido:* ' + new Date().toLocaleString('es-ES');
    message += '\n\n';
    message += '✅ *Por favor confirma la recepción de este pedido*';
    
    return message;
  },

  async sendOrderToWhatsApp(orderData: OrderData): Promise<boolean> {
    try {
      const message = this.formatOrderMessage(orderData);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
      
      // Verificar si WhatsApp está disponible
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        // Si WhatsApp no está disponible, intentar con WhatsApp Web
        const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      return false;
    }
  },

  validatePhoneNumber(phoneNumber: string): boolean {
    // Validar que el número tenga el formato correcto
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
  }
};
