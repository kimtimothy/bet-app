import React, { useState } from 'react';
import { Alert, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { searchUsers, addFriend } from '../services/api';
import LoadingButton from '../components/LoadingButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchUsers'>;

interface User {
  id: string;
  username?: string | null;
  email?: string | null;
}

export default function SearchUsersScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Enter a search term');
      return;
    }
    setLoading(true);
    try {
      const response = await searchUsers(query.trim());
      setResults(response.data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    setAddingFriendId(friendId);
    try {
      await addFriend(friendId);
      Alert.alert('Friend added');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message ?? 'Failed to add friend');
    } finally {
      setAddingFriendId(null);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <View className="p-3 bg-white mb-2 rounded-lg shadow">
      <Text className="text-base font-semibold">
        {item.username || item.email || item.id}
      </Text>
      <Text className="text-sm text-gray-500 mb-2">
        {item.email ?? 'No email'}
      </Text>
      <LoadingButton
        label="Add Friend"
        onPress={() => handleAddFriend(item.id)}
        loading={addingFriendId === item.id}
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
        <Text className="text-2xl font-bold mb-4">Find Friends</Text>
        <TextInput
          className="border border-gray-300 bg-white p-3 mb-3 rounded-md text-base"
          placeholder="Search by username or email"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <LoadingButton
          label="Search"
          onPress={handleSearch}
          loading={loading}
          className="bg-primary px-4 py-3 rounded-md mb-4"
        />
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            results.length === 0
              ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
              : undefined
          }
          ListEmptyComponent={<Text className="text-gray-500">No users found. Try a different search.</Text>}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}