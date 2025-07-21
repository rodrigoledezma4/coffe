import { CartItem } from '../types';

const API_BASE_URL = 'https://back-coffee.onrender.com/api';

export interface CreateOrderRequest {
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  additionalInfo?: string;
  paymentMethod: 'qr' | 'card';
  paymentCode?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'entregado' | 'cancelled';
  deliveryAddress: string;
  additionalInfo?: string;
  paymentMethod: string;
  paymentCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: any;
  order?: Order;
}

export const orderService = {
  async createOrder(orderData: CreateOrderRequest, token: string): Promise<OrderResponse> {
    try {
      console.log('📝 OrderService: Creating order:', orderData);
      
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('📡 OrderService: Create order response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Pedido creado exitosamente',
          order: data.pedido || data.order,
          data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear el pedido',
          data
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Create order error:', error);
      return {
        success: false,
        message: 'Error de conexión al crear el pedido'
      };
    }
  },

  async getOrders(token: string): Promise<OrderResponse> {
    try {
      console.log('📋 OrderService: Getting orders');
      
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📡 OrderService: Get orders response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: 'Pedidos obtenidos exitosamente',
          data: data.pedidos || data.orders || []
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener los pedidos',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Get orders error:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener los pedidos',
        data: []
      };
    }
  },

  async getOrderById(orderId: string, token: string): Promise<OrderResponse> {
    try {
      console.log('🔍 OrderService: Getting order by ID:', orderId);
      
      const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📡 OrderService: Get order response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: 'Pedido obtenido exitosamente',
          order: data.pedido || data.order,
          data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener el pedido',
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Get order error:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener el pedido'
      };
    }
  },

  async updateOrderStatus(orderId: string, status: string, token: string): Promise<OrderResponse> {
    try {
      console.log('🔄 OrderService: Updating order status:', orderId, status);
      
      const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      console.log('📡 OrderService: Update status response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Estado del pedido actualizado',
          order: data.pedido || data.order,
          data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar el estado del pedido',
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Update status error:', error);
      return {
        success: false,
        message: 'Error de conexión al actualizar el estado'
      };
    }
  },

  async cancelOrder(orderId: string, token: string): Promise<OrderResponse> {
    try {
      console.log('❌ OrderService: Cancelling order:', orderId);
      
      const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📡 OrderService: Cancel order response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Pedido cancelado exitosamente',
          order: data.pedido || data.order,
          data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al cancelar el pedido',
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Cancel order error:', error);
      return {
        success: false,
        message: 'Error de conexión al cancelar el pedido'
      };
    }
  },

  async getAllOrdersForAdmin(token: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrderResponse> {
    try {
      console.log('📋 OrderService: Getting all orders for admin with params:', params);
      
      // Build URL with parameters
      let url = `${API_BASE_URL}/pedidos`;
      const searchParams = new URLSearchParams();
      
      if (params?.status) {
        searchParams.append('status', params.status);
      }
      if (params?.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      
      console.log('🌐 Final orders URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📡 OrderService: Get all orders response:', response.status, data);

      if (response.ok) {
        return {
          success: true,
          message: 'Pedidos obtenidos exitosamente',
          data: data.pedidos || data.orders || data || []
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener los pedidos',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ OrderService: Get all orders error:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener los pedidos',
        data: []
      };
    }
  },
};
