import React, { useState, useEffect } from 'react';
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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 p-4"
      >
        <Text className="text-2xl mb-4 font-bold">Create a New Bet</Text>
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Bet description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Wager (units)"
          value={wager}
          onChangeText={setWager}
          keyboardType="numeric"
        />
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Opponent ID (Supabase UUID)"
          value={opponentId}
          onChangeText={setOpponentId}
          autoCapitalize="none"
        />
        <LoadingButton
          label="Create Bet"
          onPress={handleCreate}
          loading={loading}
          className="bg-blue-600 p-3 rounded-md mt-1"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}