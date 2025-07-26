import React, { useState, useEffect } from 'react';
import {
  Alert,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { createBet } from '../services/api';
import LoadingButton from '../components/LoadingButton';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBet'>;

export default function CreateBetScreen({ navigation, route }: Props) {
  const [description, setDescription] = useState('');
  const [wager, setWager] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill opponent ID if provided via route params
  useEffect(() => {
    if (route.params?.opponentId) {
      setOpponentId(route.params.opponentId);
    }
  }, [route.params?.opponentId]);

  const handleCreate = async () => {
    const wagerValue = parseInt(wager, 10);
    const opponentIdValue = opponentId.trim();
    if (!description || isNaN(wagerValue) || opponentIdValue === '') {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }
    setLoading(true);
    try {
      await createBet(description, wagerValue, opponentIdValue);
      Alert.alert('Success', 'Bet created');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to create bet');
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
        <Text style={styles.title}>Create a New Bet</Text>
        <TextInput
          style={styles.input}
          placeholder="Bet description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Wager (units)"
          value={wager}
          onChangeText={setWager}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Opponent ID (Supabase UUID)"
          value={opponentId}
          onChangeText={setOpponentId}
          autoCapitalize="none"
        />
        <LoadingButton
          label="Create Bet"
          onPress={handleCreate}
          loading={loading}
          style={styles.button}
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
    marginBottom: 16,
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
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
  },
});