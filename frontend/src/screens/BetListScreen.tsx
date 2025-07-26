import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fetchBets, setAuthToken } from '../services/api';
import LoadingButton from '../components/LoadingButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Bets'>;

interface Bet {
  id: number;
  description: string;
  wager: number;
  status: string;
  creator_id: string;
  opponent_id: string;
  winner_id?: string | null;
}

export default function BetListScreen({ navigation }: Props) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBets = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // not authenticated
        navigation.replace('Login');
        return;
      }
      setAuthToken(token);
      const response = await fetchBets();
      setBets(response.data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to load bets');
    } finally {
      setLoading(false);
    }
  };

  // Reload bets when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBets();
    }, [])
  );

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setAuthToken(null);
    navigation.replace('Login');
  };

  const renderItem = ({ item }: { item: Bet }) => {
    // Compute a human readable label for the status and colour
    let statusColour = 'text-gray-600';
    let statusLabel = '';
    switch (item.status) {
      case 'pending':
        statusLabel = 'Pending';
        statusColour = 'text-yellow-600';
        break;
      case 'active':
        statusLabel = 'Active';
        statusColour = 'text-blue-600';
        break;
      case 'resolved':
        statusLabel = item.winner_id ? (item.winner_id === item.creator_id ? 'You won' : 'You lost') : 'Resolved';
        statusColour = item.winner_id && item.winner_id === item.creator_id ? 'text-green-600' : 'text-red-600';
        break;
      default:
        statusLabel = item.status;
    }
    return (
      <View className="p-4 bg-white rounded-lg mb-3 shadow">
        <Text className="text-lg font-semibold mb-1">{item.description}</Text>
        <Text className="text-sm text-gray-500">Wager: {item.wager} units</Text>
        <Text className={`text-sm mt-1 ${statusColour}`}>{statusLabel}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 p-4"
      >
        <Text className="text-2xl font-bold mb-4">My Bets</Text>
        <LoadingButton
          label="New Bet"
          onPress={() => navigation.navigate('CreateBet')}
          className="bg-blue-600 px-4 py-2 rounded-md mb-3"
        />
        <LoadingButton
          label="Sign Out"
          onPress={signOut}
          className="bg-red-600 px-4 py-2 rounded-md mb-3"
        />
        <LoadingButton
          label="Friends"
          onPress={() => navigation.navigate('Friends')}
          className="bg-green-600 px-4 py-2 rounded-md mb-3"
        />
        <LoadingButton
          label="Find Friends"
          onPress={() => navigation.navigate('SearchUsers')}
          className="bg-yellow-600 px-4 py-2 rounded-md mb-3"
        />
        <LoadingButton
          label="Profile"
          onPress={() => navigation.navigate('Profile')}
          className="bg-purple-600 px-4 py-2 rounded-md mb-3"
        />
        {loading ? (
          <ActivityIndicator size="large" className="flex-1" />
        ) : (
          <FlatList
            data={bets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={
              bets.length === 0
                ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                : undefined
            }
            ListEmptyComponent={<Text className="text-gray-600">No bets yet. Create one!</Text>}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}