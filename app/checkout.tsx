"use client"

import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { MapAddressSelector } from "../src/components/MapAddressSelector"
import { Colors } from "../src/constants/Colors"
import { useAuth } from "../src/context/AuthContext"
import { orderService } from "../src/services/orderService"
import { whatsappService } from "../src/services/whatsappService"
import type { CartItem } from "../src/types"

export default function CheckoutScreen() {
  const params = useLocalSearchParams()
  const cartData = params.cart ? JSON.parse(params.cart as string) : []
  const totalAmount = params.total ? Number.parseFloat(params.total as string) : 0
  const { state } = useAuth()

  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    additionalInfo: "",
  })

  const [paymentMethod] = useState("whatsapp")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)

  const handleAddressSelect = (addressData: {
    address: string
    coordinates: { latitude: number; longitude: number }
    additionalInfo: string
  }) => {
    console.log("📍 Dirección seleccionada:", addressData)
    setDeliveryAddress(addressData)
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.address.trim()) {
      Alert.alert("Error", "Por favor, selecciona una dirección de entrega.")
      return
    }

    // Verificar si el usuario está autenticado
    if (!state.isAuthenticated || !state.user || !state.token) {
      Alert.alert("Inicio de sesión requerido", "Debes iniciar sesión para realizar un pedido.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Iniciar sesión", onPress: () => router.push("/") },
      ])
      return
    }

    // Mostrar información de la dirección antes de confirmar
    const hasCoordinates = deliveryAddress.coordinates.latitude !== 0 && deliveryAddress.coordinates.longitude !== 0
    const confirmMessage = hasCoordinates
      ? `¿Estás seguro de que quieres realizar este pedido?\n\n📍 Dirección: ${deliveryAddress.address}\n🗺️ Se incluirá enlace al mapa para facilitar la entrega.`
      : `¿Estás seguro de que quieres realizar este pedido?\n\n📍 Dirección: ${deliveryAddress.address}`

    Alert.alert("Confirmar Pedido", confirmMessage, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setOrderPlaced(true)

          try {
            // 1. Crear el pedido en la base de datos primero
            console.log("🔄 Creating order in database...")

            // Preparar datos del pedido para la API
            const orderRequest = {
              productos: cartData.map((item: CartItem) => ({
                productoId: item.id,
                cantidad: item.quantity,
              })),
            }

            console.log("📤 Order request data:", JSON.stringify(orderRequest, null, 2))

            // Llamar al servicio para crear el pedido
            const orderResponse = await orderService.createOrder(orderRequest, state.token!)

            console.log("📡 Order creation response:", orderResponse)

            if (orderResponse.success) {
              console.log("✅ Order created successfully in database")

              // 2. Preparar datos del pedido para WhatsApp (incluyendo coordenadas)
              const orderData = {
                cartItems: cartData,
                total: totalAmount,
                deliveryAddress: {
                  address: deliveryAddress.address,
                  additionalInfo: deliveryAddress.additionalInfo,
                  coordinates: deliveryAddress.coordinates, // Incluir coordenadas para el enlace del mapa
                },
                paymentMethod,
                user: state.user,
                orderId: orderResponse.data?.pedidos?.[0]?._id || "N/A",
              }

              console.log("📍 Sending order with coordinates:", orderData.deliveryAddress.coordinates)

              // 3. Enviar pedido por WhatsApp
              const sentToWhatsApp = await whatsappService.sendOrderToWhatsApp(orderData)

              if (sentToWhatsApp) {
                setTimeout(() => {
                  Alert.alert(
                    "Pedido Creado y Enviado",
                    "Tu pedido ha sido registrado en la base de datos y enviado por WhatsApp con la ubicación exacta. Recibirás confirmación del comercio pronto.",
                    [
                      {
                        text: "OK",
                        onPress: () => router.replace("/"),
                      },
                    ],
                  )
                }, 2000)
              } else {
                // Si falla WhatsApp pero el pedido ya está creado
                setTimeout(() => {
                  Alert.alert(
                    "Pedido Creado",
                    "Tu pedido ha sido registrado exitosamente en la base de datos. Por favor, contacta directamente al +591 72284092 para confirmar tu pedido.",
                    [
                      {
                        text: "OK",
                        onPress: () => router.replace("/"),
                      },
                    ],
                  )
                }, 2000)
              }
            } else {
              // Error al crear el pedido en la base de datos
              console.error("❌ Failed to create order in database:", orderResponse.message)

              Alert.alert(
                "Error al Crear Pedido",
                `No se pudo registrar el pedido en la base de datos: ${orderResponse.message}`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setOrderPlaced(false)
                    },
                  },
                ],
              )
            }
          } catch (error) {
            console.error("❌ Error creating order:", error)

            Alert.alert(
              "Error de Conexión",
              "No se pudo conectar con el servidor para crear el pedido. Verifica tu conexión a internet.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    setOrderPlaced(false)
                  },
                },
              ],
            )
          }
        },
      },
    ])
  }

  if (orderPlaced) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="logo-whatsapp" size={80} color="#25D366" />
          <Text style={styles.successTitle}>¡Enviando Pedido!</Text>
          <Text style={styles.successText}>
            Tu pedido se está enviando por WhatsApp con la ubicación exacta. Te redirigiremos a la aplicación.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Finalizar Pedido</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del cliente */}
        {state.isAuthenticated && state.user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Cliente</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {state.user.name} {state.user.lastName || ""}
              </Text>
              <Text style={styles.userEmail}>{state.user.email}</Text>
              {state.user.phone && <Text style={styles.userPhone}>{state.user.phone}</Text>}
            </View>
          </View>
        )}

        {/* Resumen del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          {cartData.map((item: CartItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemInfo}>
                  {item.pack} • Cantidad: {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>Bs{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalAmount}>Bs{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Dirección de entrega con mapa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Entrega</Text>

          {deliveryAddress.address ? (
            <View style={styles.selectedAddressContainer}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color={Colors.light.primary} />
                <Text style={styles.selectedAddressTitle}>Dirección seleccionada:</Text>
              </View>
              <Text style={styles.selectedAddressText}>{deliveryAddress.address}</Text>

              {/* Mostrar coordenadas si están disponibles */}
              {deliveryAddress.coordinates.latitude !== 0 && deliveryAddress.coordinates.longitude !== 0 && (
                <View style={styles.coordinatesContainer}>
                  <Ionicons name="navigate" size={16} color={Colors.light.success} />
                  <Text style={styles.coordinatesText}>
                    Ubicación GPS: {deliveryAddress.coordinates.latitude.toFixed(6)},{" "}
                    {deliveryAddress.coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              {deliveryAddress.additionalInfo && (
                <Text style={styles.additionalInfoText}>Información adicional: {deliveryAddress.additionalInfo}</Text>
              )}

              <TouchableOpacity style={styles.changeAddressButton} onPress={() => setMapVisible(true)}>
                <Ionicons name="pencil" size={16} color={Colors.light.primary} />
                <Text style={styles.changeAddressText}>Cambiar dirección</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.selectAddressButton} onPress={() => setMapVisible(true)}>
              <Ionicons name="map" size={24} color="#fff" />
              <Text style={styles.selectAddressText}>Seleccionar en el mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Realizar Pedido - Bs{totalAmount.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Map Address Selector Modal */}
      <MapAddressSelector
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onAddressSelect={handleAddressSelect}
        initialAddress={deliveryAddress.address}
        initialAdditionalInfo={deliveryAddress.additionalInfo}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  itemInfo: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  placeOrderButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: "center",
    lineHeight: 24,
  },
  userInfo: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  selectAddressButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectAddressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  selectedAddressContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedAddressTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.text,
    marginLeft: 8,
  },
  selectedAddressText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#E8F5E8",
    padding: 8,
    borderRadius: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.light.success,
    marginLeft: 6,
    fontFamily: "monospace",
  },
  additionalInfoText: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: "italic",
    marginBottom: 12,
  },
  changeAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  changeAddressText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})
