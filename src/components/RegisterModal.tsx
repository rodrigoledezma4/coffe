import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterModal({ visible, onClose, onNavigateToLogin }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    // Add console log to verify function is being called
    console.log('🔄 Starting registration process...');
    
    if (!name || !lastName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor, ingresa un email válido');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Error', 'Por favor, ingresa un número de teléfono válido');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        nombreUsr: name.trim(),
        apellidoUsr: lastName.trim(),
        celUsr: phone.trim(),
        emailUsr: email.toLowerCase().trim(),
        contraseña: password,
      };

      console.log('📤 Sending registration request:', requestBody);

      const response = await fetch('https://back-coffee.onrender.com/api/usuarios/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      
      let data;
      try {
        const responseText = await response.text();
        console.log('📥 Raw response:', responseText);
        data = responseText ? JSON.parse(responseText) : {};
        console.log('📥 Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ Error parsing response JSON:', parseError);
        Alert.alert('Error', 'Error en la respuesta del servidor');
        return;
      }

      if (response.ok) {
        // Manejar diferentes formatos de respuesta exitosa
        const userData = {
          id: data.usuario?._id || data.data?.usuario?._id || data.usuario?.id || Date.now().toString(),
          name: data.usuario?.nombreUsr || name.trim(),
          lastName: data.usuario?.apellidoUsr || lastName.trim(),
          email: data.usuario?.emailUsr || email.toLowerCase().trim(),
          phone: data.usuario?.celUsr || phone.trim(),
          role: 'user' as const,
        };

        const token = data.token || data.data?.token || 'registration-token-' + Date.now();

        console.log('✅ Registration successful, logging in user:', userData);
        await login(userData, token);

        // Reset form
        resetForm();
        onClose();
        Alert.alert('Éxito', 'Registro exitoso. ¡Bienvenido!');
      } else {
        // Manejar errores del servidor
        const errorMessage = data.message || data.error || data.msg || 'Error al registrar usuario';
        console.error('❌ Registration failed:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu internet y vuelve a intentar.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNavigateToLogin = () => {
    resetForm();
    onNavigateToLogin();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <Text style={styles.title}>Registrarse</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu apellido"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3001234567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginLink} onPress={handleNavigateToLogin} disabled={loading}>
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    minHeight: 48,
  },
  registerButton: {
    backgroundColor: '#795548',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    minHeight: 50,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    color: '#795548',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

