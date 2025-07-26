import React, { useState } from 'react';
import { Text, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getFriends } from '../services/api';
import LoadingButton from '../components/LoadingButton';
import { useCallback } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>;

interface User {
  id: string;
  username?: string | null;
  email?: string | null;
}

export default function FriendsScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await getFriends();
      setFriends(response.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const renderItem = ({ item }: { item: User }) => (
    <View className="p-3 bg-white mb-2 rounded-lg shadow">
      <Text className="text-base font-semibold">
        {item.username || item.email || item.id}
      </Text>
      <Text className="text-sm text-gray-500 mb-2">{item.email ?? 'No email'}</Text>
      <LoadingButton
        label="Start Bet"
        onPress={() => navigation.navigate('CreateBet', { opponentId: item.id })}
        className="bg-primary px-3 py-2 rounded-md"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 p-4"
      >
        <Text className="text-2xl font-bold mb-4">Friends</Text>
        {loading ? (
          <Text className="text-center">Loading...</Text>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              friends.length === 0
                ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                : undefined
            }
            ListEmptyComponent={<Text className="text-gray-500">You have no friends yet.</Text>}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}