import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../src/services/orderService';
import { useAuth } from '../src/context/AuthContext';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'entregado' | 'delivered' | 'cancelled';
  date: string;
  address: string;
  paymentMethod: string;
}

export default function OrdersReportScreen() {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrders = async () => {
    if (!state.token) {
      Alert.alert('Error', 'No tienes autorización para ver los pedidos');
      router.back();
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Loading orders from API...');
      
      const result = await orderService.getAllOrdersForAdmin(state.token, {
        limit: 1000
      });

      if (result.success && result.data) {
        console.log('📦 Raw orders response:', result.data);
        
        let ordersArray = [];
        if (Array.isArray(result.data)) {
          ordersArray = result.data;
        } else if (result.data.orders && Array.isArray(result.data.orders)) {
          ordersArray = result.data.orders;
        } else if (result.data.pedidos && Array.isArray(result.data.pedidos)) {
          ordersArray = result.data.pedidos;
        }

        console.log('📋 Orders array found:', ordersArray.length);

        const formattedOrders: Order[] = ordersArray.map((order: any) => {
          console.log('🔍 Processing order:', order);
          
          // Extraer información del usuario con múltiples formatos posibles
          let customerName = 'Cliente Desconocido';
          let customerPhone = 'Sin teléfono';
          
          if (order.usuarioId) {
            customerName = order.usuarioId.nombreUsr || order.usuarioId.name || customerName;
            customerPhone = order.usuarioId.celUsr || order.usuarioId.phone || customerPhone;
          } else if (order.userId) {
            customerName = order.userId.nombreUsr || order.userId.name || customerName;
            customerPhone = order.userId.celUsr || order.userId.phone || customerPhone;
          } else if (order.user) {
            customerName = order.user.nombreUsr || order.user.name || customerName;
            customerPhone = order.user.celUsr || order.user.phone || customerPhone;
          }
          
          return {
            id: order._id || order.id || 'unknown',
            customerName,
            customerPhone,
            items: order.productos || order.items || [],
            total: order.total || 0,
            status: order.estado || order.status || 'pending',
            date: new Date(order.fechaPedido || order.createdAt || order.fecha || Date.now()).toLocaleString('es-ES'),
            address: order.direccionEntrega || order.deliveryAddress || order.address || 'Sin dirección',
            paymentMethod: order.metodoPago || order.paymentMethod || 'No especificado',
          };
        });

        console.log('✅ Formatted orders:', formattedOrders.length);
        console.log('📊 Orders by status:', formattedOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        setOrders(formattedOrders);
      } else {
        console.error('❌ Failed to load orders:', result.message);
        Alert.alert('Error', result.message || 'No se pudieron cargar los pedidos');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Error', 'Error de conexión al cargar los pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'entregado': return 'Entregado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#9C27B0';
      case 'entregado': return '#4CAF50';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!state.token) {
      Alert.alert('Error', 'No tienes autorización');
      return;
    }

    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus, state.token);
      
      if (result.success) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus as any }
              : order
          )
        );
        Alert.alert('Éxito', 'Estado del pedido actualizado');
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Pedidos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Pedidos ({filteredOrders.length})</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#795548" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'confirmed', 'preparing', 'entregado', 'delivered', 'cancelled'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.activeFilterButton
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === status && styles.activeFilterButtonText
            ]}>
              {status === 'all' ? 'Todos' : getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Cargando pedidos reales...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Pedido #{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerPhone}>{order.customerPhone}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.orderItem}>
                    {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.orderTotal}>Total: ${order.total.toFixed(2)}</Text>
                  <Text style={styles.paymentMethod}>{order.paymentMethod}</Text>
                </View>
                
                {order.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      <Text style={styles.buttonText}>Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {order.status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.preparingButton}
                    onPress={() => updateOrderStatus(order.id, 'preparing')}
                  >
                    <Text style={styles.buttonText}>Preparando</Text>
                  </TouchableOpacity>
                )}
                
                {order.status === 'preparing' && (
                  <TouchableOpacity
                    style={styles.deliveredButton}
                    onPress={() => updateOrderStatus(order.id, 'entregado')}
                  >
                    <Text style={styles.buttonText}>Entregado</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.orderAddress}>📍 {order.address}</Text>
            </View>
          ))}

          {filteredOrders.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No hay pedidos {filterStatus !== 'all' ? `con estado "${getStatusText(filterStatus)}"` : ''}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilterButton: {
    backgroundColor: '#795548',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#795548',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  preparingButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deliveredButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderAddress: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
});
