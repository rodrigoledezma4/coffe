// Test para verificar la funcionalidad de WhatsApp
const { whatsappService } = require('./src/services/whatsappService');

// Datos de prueba
const testOrderData = {
  cartItems: [
    {
      id: '1',
      name: 'Café Americano',
      price: 5.50,
      pack: '250g',
      quantity: 2,
      image: 'test-image.jpg'
    },
    {
      id: '2',
      name: 'Café Latte',
      price: 6.00,
      pack: '300g',
      quantity: 1,
      image: 'test-image2.jpg'
    }
  ],
  total: 17.00,
  deliveryAddress: {
    address: 'Calle 123 # 45-67, Bogotá',
    additionalInfo: 'Apartamento 301, timbre azul'
  },
  paymentMethod: 'whatsapp',
  user: {
    id: '1',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+57 300 555 1234',
    role: 'user'
  }
};

// Generar mensaje de prueba
console.log('=== MENSAJE DE WHATSAPP GENERADO ===');
console.log(whatsappService.formatOrderMessage(testOrderData));
console.log('=== FIN DEL MENSAJE ===');
