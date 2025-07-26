import React, { useState } from 'react';
import { Alert, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
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
    <View style={styles.userItem}>
      <Text style={styles.userName}>
        {item.username || item.email || item.id}
      </Text>
      <Text style={styles.userEmail}>
        {item.email ?? 'No email'}
      </Text>
      <LoadingButton
        label="Add Friend"
        onPress={() => handleAddFriend(item.id)}
        loading={addingFriendId === item.id}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Find Friends</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by username or email"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <LoadingButton
          label="Search"
          onPress={handleSearch}
          loading={loading}
          style={styles.searchButton}
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
          ListEmptyComponent={<Text style={styles.emptyText}>No users found. Try a different search.</Text>}
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
  searchButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  userItem: {
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyText: {
    color: '#6b7280',
  },
});