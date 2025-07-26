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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) {
        throw error;
      }
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        Alert.alert('Success', 'Account created! Please check your email to confirm.');
        navigation.replace('Login');
      } else if (data.session) {
        // User is automatically signed in (no email confirmation required)
        const accessToken = data.session.access_token;
        await AsyncStorage.setItem('token', accessToken);
        setAuthToken(accessToken);
        // Navigate to main app and reset the navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Bets' }],
        });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Registration failed', err.message ?? 'An error occurred');
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
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
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
          label="Register"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />
        <Text style={styles.loginText}>
          Already have an account?
        </Text>
        <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          Sign In
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
  registerButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loginLink: {
    textAlign: 'center',
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
});