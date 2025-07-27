"use client"

import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MapView, { Marker, type Region } from "react-native-maps"

interface LocationCoordinates {
  latitude: number
  longitude: number
  address?: string
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationCoordinates) => void
  initialLocation?: LocationCoordinates
}

const { width, height } = Dimensions.get("window")

export function MapLocationPicker({ onLocationSelect, initialLocation }: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(initialLocation || null)
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || -17.7833, // La Paz, Bolivia
    longitude: initialLocation?.longitude || -63.1821,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null)

  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setLocationPermission(status === "granted")

      if (status === "granted" && !initialLocation) {
        getCurrentLocation()
      }
    } catch (error) {
      console.error("Error requesting location permission:", error)
      setLocationPermission(false)
    }
  }

  const getCurrentLocation = async () => {
    if (!locationPermission) return

    setLoading(true)
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }

      setRegion(newRegion)

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setSelectedLocation(newLocation)

      // Get address from coordinates
      const address = await getAddressFromCoordinates(newLocation)
      const locationWithAddress = { ...newLocation, address }

      setSelectedLocation(locationWithAddress)
      onLocationSelect(locationWithAddress)
    } catch (error) {
      console.error("Error getting current location:", error)
      Alert.alert("Error", "No se pudo obtener tu ubicación actual")
    } finally {
      setLoading(false)
    }
  }

  const getAddressFromCoordinates = async (coords: LocationCoordinates): Promise<string> => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      })

      if (address) {
        const parts = [address.street, address.streetNumber, address.district, address.city, address.region].filter(
          Boolean,
        )

        return parts.join(", ") || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
      }

      return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
    } catch (error) {
      console.error("Error getting address:", error)
      return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
    }
  }

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate

    setLoading(true)
    const newLocation = { latitude, longitude }

    try {
      const address = await getAddressFromCoordinates(newLocation)
      const locationWithAddress = { ...newLocation, address }

      setSelectedLocation(locationWithAddress)
      onLocationSelect(locationWithAddress)
    } catch (error) {
      console.error("Error processing location:", error)
      setSelectedLocation(newLocation)
      onLocationSelect(newLocation)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      Alert.alert(
        "Confirmar Ubicación",
        `¿Confirmas esta ubicación para la entrega?\n\n${selectedLocation.address || "Coordenadas: " + selectedLocation.latitude.toFixed(6) + ", " + selectedLocation.longitude.toFixed(6)}`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar",
            onPress: () => onLocationSelect(selectedLocation),
          },
        ],
      )
    } else {
      Alert.alert("Error", "Por favor selecciona una ubicación en el mapa")
    }
  }

  if (locationPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#795548" />
        <Text style={styles.loadingText}>Solicitando permisos de ubicación...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={24} color="#795548" />
        <Text style={styles.headerText}>Selecciona tu ubicación de entrega</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={locationPermission === true}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Ubicación de entrega"
              description={selectedLocation.address || "Ubicación seleccionada"}
              pinColor="#795548"
            />
          )}
        </MapView>

        {loading && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color="#795548" />
            <Text style={styles.overlayText}>Obteniendo dirección...</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {locationPermission && (
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={loading}>
            <Ionicons name="locate" size={20} color="#fff" />
            <Text style={styles.locationButtonText}>Mi ubicación</Text>
          </TouchableOpacity>
        )}

        {selectedLocation && (
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.selectedLocationTitle}>Ubicación seleccionada:</Text>
            <Text style={styles.selectedLocationText}>
              {selectedLocation.address ||
                `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>📍 Toca en el mapa para seleccionar tu ubicación de entrega</Text>
        {!locationPermission && (
          <Text style={styles.warningText}>⚠️ Permite el acceso a la ubicación para una mejor experiencia</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    marginTop: 8,
    fontSize: 14,
    color: "#795548",
    fontWeight: "500",
  },
  controls: {
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#795548",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  selectedLocationInfo: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#795548",
  },
  selectedLocationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  instructions: {
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    padding: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#2e7d32",
    textAlign: "center",
    lineHeight: 20,
  },
  warningText: {
    fontSize: 12,
    color: "#ff9800",
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
})
