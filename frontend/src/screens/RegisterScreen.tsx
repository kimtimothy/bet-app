import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
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
      Alert.alert('Success', 'Account created! Please check your email to confirm.');
      navigation.replace('Login');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Registration failed', err.message ?? 'An error occurred');
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
        <Text className="text-3xl mb-6 text-center font-bold">Create an Account</Text>
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
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
          label="Sign Up"
          onPress={handleRegister}
          loading={loading}
          className="bg-blue-600 p-3 rounded-md"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}