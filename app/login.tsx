import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { saveActiveUser, getAllUsers, registerUserAsync, loadUsersAsync, UserAccount } from '../services/historyStorage';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar la lista de usuarios guardados en AsyncStorage/localStorage
    loadUsersAsync();
  }, []);

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    if (isRegistering) {
      if (!name.trim() || !license.trim()) {
        setError('Por favor completa tu nombre completo y Licencia TMA.');
        return;
      }

      if (password.trim().length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      const newUser: UserAccount = {
        name: name.trim(),
        email: cleanEmail,
        license: license.trim().toUpperCase(),
        password: password.trim(),
      };

      // Guardar el usuario de forma persistente en almacenamiento nativo/web
      const registered = await registerUserAsync(newUser);

      if (!registered) {
        setError('Este correo electrónico ya está registrado.');
        return;
      }

      setSuccessMessage('¡Cuenta creada y guardada exitosamente! Inicia sesión.');
      setIsRegistering(false);
      setPassword('');
      
      if (Platform.OS !== 'web') {
        Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada y guardada.');
      }
    } else {
      await loadUsersAsync();
      const users = getAllUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        setError('No existe una cuenta registrada con este correo.');
        return;
      }

      if (foundUser.password && foundUser.password !== password.trim()) {
        setError('Contraseña incorrecta.');
        return;
      }

      saveActiveUser(foundUser);
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingVertical: isMobile ? 40 : 20 }]}>
      <View style={[styles.card, { padding: isMobile ? 18 : 24 }]}>
        <View style={styles.iconHeader}>
          <Ionicons name="airplane" size={30} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Sistema OMA / Mantenimiento</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Registro de Nuevo Técnico Autorizado' : 'Ingresa tus credenciales verificadas'}
        </Text>

        {!!successMessage && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {isRegistering && (
          <>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Valeria Hernández"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </>
        )}

        <Text style={styles.label}>Correo Electrónico *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. usuario@dominio.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isRegistering && (
          <>
            <Text style={styles.label}>Número de Licencia TMA *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. TMA #402"
              placeholderTextColor="#94A3B8"
              value={license}
              onChangeText={setLicense}
            />
          </>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.switchModeBtn}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccessMessage('');
          }}
        >
          <Text style={styles.switchModeText}>
            {isRegistering
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta? Regístrate aquí'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  iconHeader: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: 12 },
  errorText: { color: '#DC2626', fontSize: 11, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  successBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', padding: 8, borderRadius: 8, marginBottom: 14, gap: 6 },
  successText: { color: '#047857', fontSize: 11, fontWeight: '700', flex: 1 },
  submitBtn: { backgroundColor: '#0284C7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  switchModeBtn: { marginTop: 14, alignItems: 'center' },
  switchModeText: { color: '#0284C7', fontSize: 11, fontWeight: '700' },
});