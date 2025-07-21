import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/Colors';
import { CartItem } from '../src/types';
import { whatsappService } from '../src/services/whatsappService';
import { useAuth } from '../src/context/AuthContext';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const cartData = params.cart ? JSON.parse(params.cart as string) : [];
  const totalAmount = params.total ? parseFloat(params.total as string) : 0;
  const { state } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    additionalInfo: '',
  });
  
  const [paymentMethod] = useState('whatsapp'); // Agregar esta línea
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.address.trim()) {
      Alert.alert('Error', 'Por favor, completa la dirección de entrega.');
      return;
    }

    // Verificar si el usuario está autenticado
    if (!state.isAuthenticated || !state.user) {
      Alert.alert(
        'Inicio de sesión requerido',
        'Debes iniciar sesión para realizar un pedido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => router.push('/') }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirmar Pedido',
      '¿Estás seguro de que quieres realizar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setOrderPlaced(true);
            
            // Preparar datos del pedido para WhatsApp
            const orderData = {
              cartItems: cartData,
              total: totalAmount,
              deliveryAddress,
              paymentMethod,
              user: state.user
            };

            try {
              // Enviar pedido por WhatsApp
              const sentToWhatsApp = await whatsappService.sendOrderToWhatsApp(orderData);
              
              if (sentToWhatsApp) {
                setTimeout(() => {
                  Alert.alert(
                    'Pedido Enviado',
                    'Tu pedido ha sido enviado por WhatsApp. Recibirás confirmación del comercio pronto.',
                    [
                      {
                        text: 'OK',
                        onPress: () => router.replace('/'),
                      }
                    ]
                  );
                }, 2000);
              } else {
                throw new Error('No se pudo enviar por WhatsApp');
              }
            } catch (error) {
              console.error('Error enviando pedido:', error);
              Alert.alert(
                'Error al Enviar',
                'No se pudo enviar el pedido por WhatsApp. Por favor, contacta directamente al +57 300 123 4567',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/'),
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  if (orderPlaced) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="logo-whatsapp" size={80} color="#25D366" />
          <Text style={styles.successTitle}>¡Enviando Pedido!</Text>
          <Text style={styles.successText}>
            Tu pedido se está enviando por WhatsApp. Te redirigiremos a la aplicación.
          </Text>
        </View>
      </View>
    );
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
                {state.user.name} {state.user.lastName || ''}
              </Text>
              <Text style={styles.userEmail}>{state.user.email}</Text>
              {state.user.phone && (
                <Text style={styles.userPhone}>{state.user.phone}</Text>
              )}
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
                <Text style={styles.itemInfo}>{item.pack} • Cantidad: {item.quantity}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Dirección de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          <TextInput
            style={styles.input}
            placeholder="Dirección completa de entrega"
            value={deliveryAddress.address}
            onChangeText={(text) => setDeliveryAddress({...deliveryAddress, address: text})}
            multiline
            numberOfLines={2}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Información adicional (opcional)"
            value={deliveryAddress.additionalInfo}
            onChangeText={(text) => setDeliveryAddress({...deliveryAddress, additionalInfo: text})}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Realizar Pedido - ${totalAmount.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: Colors.light.text,
  },
  itemInfo: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.light.surface,
    marginBottom: 12,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
  textArea: {
    height: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 24,
  },
  userInfo: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
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
});
