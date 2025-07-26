import React, { useState } from 'react';
import { Text, FlatList, KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
    <View style={styles.friendItem}>
      <Text style={styles.friendName}>
        {item.username || item.email || item.id}
      </Text>
      <Text style={styles.friendEmail}>{item.email ?? 'No email'}</Text>
      <LoadingButton
        label="Start Bet"
        onPress={() => navigation.navigate('CreateBet', { opponentId: item.id })}
        style={styles.betButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Friends</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
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
            ListEmptyComponent={<Text style={styles.emptyText}>You have no friends yet.</Text>}
          />
        )}
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
  friendItem: {
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
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  betButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loadingText: {
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
});