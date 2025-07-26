import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { setAuthToken } from '../services/api';
import { supabase } from '../services/supabase';
import LoadingButton from '../components/LoadingButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      const { session } = data;
      if (!session) {
        Alert.alert('Login failed', 'No session returned');
        return;
      }
      const accessToken = session.access_token;
      await AsyncStorage.setItem('token', accessToken);
      setAuthToken(accessToken);
      // Navigate to main app and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Bets' }],
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Login failed', err.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Welcome back!</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <LoadingButton
          label="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />
        <Text style={styles.registerText}>
          New here?
        </Text>
        <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  registerText: {
    textAlign: 'center',
    color: '#374151',
  },
  registerLink: {
    marginTop: 8,
    color: '#2563eb',
    textAlign: 'center',
  },
});