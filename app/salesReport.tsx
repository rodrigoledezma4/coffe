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

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailySales: { date: string; sales: number; orders: number }[];
}

export default function SalesReportScreen() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, 90days

  const loadSalesData = async () => {
    setLoading(true);
    try {
      // Simular datos de ventas (aquí conectarías con tu API real)
      const mockData: SalesData = {
        totalSales: 2450.75,
        totalOrders: 87,
        averageOrderValue: 28.17,
        topProducts: [
          { name: 'Café Americano', quantity: 45, revenue: 675.00 },
          { name: 'Latte Vainilla', quantity: 32, revenue: 512.00 },
          { name: 'Cappuccino', quantity: 28, revenue: 420.00 },
        ],
        dailySales: [
          { date: '2024-01-15', sales: 350.25, orders: 12 },
          { date: '2024-01-14', sales: 420.50, orders: 15 },
          { date: '2024-01-13', sales: 280.75, orders: 10 },
        ],
      };
      
      setTimeout(() => {
        setSalesData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading sales data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de ventas');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const renderSummaryCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Reportes de Ventas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#795548" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
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
        <Text style={styles.title}>Reportes de Ventas</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={[styles.dateButton, dateRange === '7days' && styles.activeDateButton]}
            onPress={() => setDateRange('7days')}
          >
            <Text style={[styles.dateButtonText, dateRange === '7days' && styles.activeDateButtonText]}>
              7 días
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateButton, dateRange === '30days' && styles.activeDateButton]}
            onPress={() => setDateRange('30days')}
          >
            <Text style={[styles.dateButtonText, dateRange === '30days' && styles.activeDateButtonText]}>
              30 días
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateButton, dateRange === '90days' && styles.activeDateButton]}
            onPress={() => setDateRange('90days')}
          >
            <Text style={[styles.dateButtonText, dateRange === '90days' && styles.activeDateButtonText]}>
              90 días
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {renderSummaryCard(
            'Ventas Totales',
            `$${salesData?.totalSales.toFixed(2)}`,
            'cash',
            '#4CAF50'
          )}
          {renderSummaryCard(
            'Pedidos Totales',
            salesData?.totalOrders.toString() || '0',
            'receipt',
            '#2196F3'
          )}
          {renderSummaryCard(
            'Promedio por Pedido',
            `$${salesData?.averageOrderValue.toFixed(2)}`,
            'trending-up',
            '#FF9800'
          )}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
          {salesData?.topProducts.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.quantity} unidades • ${product.revenue.toFixed(2)}
                </Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Daily Sales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ventas Diarias</Text>
          {salesData?.dailySales.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayDate}>{day.date}</Text>
              <View style={styles.dayStats}>
                <Text style={styles.daySales}>${day.sales.toFixed(2)}</Text>
                <Text style={styles.dayOrders}>{day.orders} pedidos</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: 24,
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
  dateRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeDateButton: {
    backgroundColor: '#795548',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeDateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 14,
    color: '#666',
  },
  rankBadge: {
    backgroundColor: '#795548',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayDate: {
    fontSize: 14,
    color: '#666',
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  daySales: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dayOrders: {
    fontSize: 12,
    color: '#666',
  },
});
