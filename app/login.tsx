import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { saveActiveUser, getAllUsers, UserAccount } from '../services/historyStorage';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (isRegistering) {
      if (!name.trim() || !license.trim()) {
        setError('Por favor completa tu nombre completo y número de licencia TMA.');
        return;
      }
      const newUser: UserAccount = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        license: license.trim().toUpperCase(),
      };
      saveActiveUser(newUser);
      if (Platform.OS !== 'web') Alert.alert('Éxito', 'Cuenta creada correctamente.');
      router.replace('/(tabs)');
    } else {
      const users = getAllUsers();
      const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (found) {
        saveActiveUser(found);
        router.replace('/(tabs)');
      } else {
        const autoUser: UserAccount = {
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          license: 'TMA #999',
        };
        saveActiveUser(autoUser);
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconHeader}>
          <Ionicons name="airplane" size={32} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Sistema OMA / Mantenimiento</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Crea tu cuenta de Técnico Autorizado (TMA)' : 'Inicia sesión con tus credenciales'}
        </Text>

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
          placeholder="Ej. valeria@oma.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
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
          <Text style={styles.submitBtnText}>{isRegistering ? 'Registrar Cuenta' : 'Iniciar Sesión'}</Text>
        </Pressable>

        <Pressable style={styles.switchModeBtn} onPress={() => { setIsRegistering(!isRegistering); setError(''); }}>
          <Text style={styles.switchModeText}>
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 420, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  iconHeader: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: 14 },
  errorText: { color: '#DC2626', fontSize: 11, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  submitBtn: { backgroundColor: '#0284C7', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  switchModeBtn: { marginTop: 16, alignItems: 'center' },
  switchModeText: { color: '#0284C7', fontSize: 12, fontWeight: '700' },
});