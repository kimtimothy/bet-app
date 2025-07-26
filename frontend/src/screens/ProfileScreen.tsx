import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { updateProfile, setAuthToken } from '../services/api';
import { supabase } from '../services/supabase';
import LoadingButton from '../components/LoadingButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current user details from Supabase session
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setEmail(data.user.email ?? '');
        const meta = data.user.user_metadata as any;
        if (meta?.username) {
          setUsername(meta.username);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!username && !email) {
      Alert.alert('Nothing to update');
      return;
    }
    setLoading(true);
    try {
      // Update Supabase user metadata for username
      if (username) {
        const { error: updateMetaError } = await supabase.auth.updateUser({ data: { username } });
        if (updateMetaError) {
          throw updateMetaError;
        }
      }
      // Update profile in backend (username/email)
      await updateProfile({ username: username || undefined, email: email || undefined });
      Alert.alert('Profile updated');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message ?? 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 p-4"
      >
        <Text className="text-2xl font-bold mb-4">Edit Profile</Text>
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
        <LoadingButton
          label="Save"
          onPress={handleSave}
          loading={loading}
          className="bg-primary px-4 py-3 rounded-md"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}