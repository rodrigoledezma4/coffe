import { Linking } from "react-native"
import type { CartItem, User } from "../types"

// Número de WhatsApp de la empresa (formato internacional sin +)
const WHATSAPP_NUMBER = "59172284092" // 591 (Bolivia) + 72284092 (tu número)

interface OrderData {
  cartItems: CartItem[]
  total: number
  deliveryAddress: {
    address: string
    additionalInfo: string
  }
  paymentMethod: string
  user?: User | null
  orderId?: string // Add order ID from database
}

export const whatsappService = {
  formatOrderMessage(orderData: OrderData): string {
    const { cartItems, total, deliveryAddress, paymentMethod, user, orderId } = orderData

    let message = "🛒 *NUEVO PEDIDO -AMBER INFUSIÓN*\n\n"

    // Add order ID if available
    if (orderId) {
      message += `📋 *ID DEL PEDIDO:* ${orderId}\n\n`
    }

    // Información del cliente
    if (user) {
      message += "👤 *DATOS DEL CLIENTE:*\n"
      message += `• Nombre: ${user.name}`
      if (user.lastName) {
        message += ` ${user.lastName}`
      }
      message += "\n"
      message += `• Email: ${user.email}\n`
      if (user.phone) {
        message += `• Teléfono: ${user.phone}\n`
      }
      message += "\n"
    }

    // Continue with the rest of the existing message format...
    message += "📋 *PRODUCTOS:*\n"
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   • Presentación: ${item.pack}\n`
      message += `   • Cantidad: ${item.quantity}\n`
      message += `   • Precio unitario: Bs${item.price.toFixed(2)}\n`
      message += `   • Subtotal: Bs${(item.price * item.quantity).toFixed(2)}\n\n`
    })

    // Total
    message += `💰 *TOTAL: Bs${total.toFixed(2)}*\n\n`

    // Dirección de entrega
    message += "📍 *DIRECCIÓN DE ENTREGA:*\n"
    message += `${deliveryAddress.address}\n`
    if (deliveryAddress.additionalInfo.trim()) {
      message += `Información adicional: ${deliveryAddress.additionalInfo}\n`
    }
    message += "\n"

    // Método de pago
    message += "💳 *MÉTODO DE PAGO:*\n"
    message +=
      paymentMethod === "qr" ? "📱 Pago con QR" : paymentMethod === "card" ? "💳 Tarjeta de crédito" : "📱 WhatsApp"
    message += "\n\n"

    // Información adicional
    message += "⏰ *Fecha del pedido:* " + new Date().toLocaleString("es-ES")
    message += "\n\n"
    message += "✅ *Por favor confirma la recepción de este pedido*"

    return message
  },

  async sendOrderToWhatsApp(orderData: OrderData): Promise<boolean> {
    try {
      console.log("Iniciando envío a WhatsApp...")
      const message = this.formatOrderMessage(orderData)
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`

      console.log("URL de WhatsApp:", whatsappUrl)

      // Verificar si WhatsApp está disponible
      const canOpen = await Linking.canOpenURL(whatsappUrl)
      console.log("¿Puede abrir WhatsApp?:", canOpen)

      if (canOpen) {
        console.log("Abriendo WhatsApp...")
        await Linking.openURL(whatsappUrl)
        return true
      } else {
        // Si WhatsApp no está disponible, intentar con WhatsApp Web
        console.log("WhatsApp no disponible, intentando con WhatsApp Web...")
        const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
        console.log("URL de WhatsApp Web:", webUrl)
        await Linking.openURL(webUrl)
        return true
      }
    } catch (error) {
      console.error("Error al enviar mensaje de WhatsApp:", error)
      return false
    }
  },

  validatePhoneNumber(phoneNumber: string): boolean {
    // Validar que el número tenga el formato correcto
    const phoneRegex = /^\d{10,15}$/
    return phoneRegex.test(phoneNumber.replace(/\D/g, ""))
  },
}
