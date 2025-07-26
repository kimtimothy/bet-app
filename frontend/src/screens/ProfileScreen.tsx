import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Edit Profile</Text>
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
        <LoadingButton
          label="Save"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
});