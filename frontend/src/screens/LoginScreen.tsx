import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
      navigation.replace('Bets');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Login failed', err.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center px-6"
      >
        <Text className="text-3xl mb-6 text-center font-bold">Welcome back!</Text>
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <LoadingButton
          label="Login"
          onPress={handleLogin}
          loading={loading}
          className="bg-blue-600 p-3 rounded-md mb-4"
        />
        <Text className="text-center text-gray-700">
          New here?
        </Text>
        <Text className="mt-2 text-blue-600 text-center" onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}