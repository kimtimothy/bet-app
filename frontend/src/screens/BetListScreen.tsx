import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fetchBets, setAuthToken } from '../services/api';
import LoadingButton from '../components/LoadingButton';
import { supabase } from '../services/supabase';

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
        // not authenticated - this should not happen with persistent login
        // but handle it gracefully
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      setAuthToken(token);
      const response = await fetchBets();
      setBets(response.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        // Token is invalid, clear it and redirect to login
        await AsyncStorage.removeItem('token');
        setAuthToken(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', 'Failed to load bets');
      }
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
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Clear local token
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      // Navigate to login and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear local state
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const renderItem = ({ item }: { item: Bet }) => {
    // Compute a human readable label for the status and colour
    let statusColor = '#6b7280';
    let statusLabel = '';
    switch (item.status) {
      case 'pending':
        statusLabel = 'Pending';
        statusColor = '#d97706';
        break;
      case 'active':
        statusLabel = 'Active';
        statusColor = '#2563eb';
        break;
      case 'resolved':
        statusLabel = item.winner_id ? (item.winner_id === item.creator_id ? 'You won' : 'You lost') : 'Resolved';
        statusColor = item.winner_id && item.winner_id === item.creator_id ? '#059669' : '#dc2626';
        break;
      default:
        statusLabel = item.status;
    }
    return (
      <View style={styles.betItem}>
        <Text style={styles.betTitle}>{item.description}</Text>
        <Text style={styles.betWager}>Wager: {item.wager} units</Text>
        <Text style={[styles.betStatus, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>My Bets</Text>
        <LoadingButton
          label="New Bet"
          onPress={() => navigation.navigate('CreateBet')}
          style={styles.blueButton}
        />
        <LoadingButton
          label="Sign Out"
          onPress={signOut}
          style={styles.redButton}
        />
        <LoadingButton
          label="Friends"
          onPress={() => navigation.navigate('Friends')}
          style={styles.greenButton}
        />
        <LoadingButton
          label="Find Friends"
          onPress={() => navigation.navigate('SearchUsers')}
          style={styles.yellowButton}
        />
        <LoadingButton
          label="Profile"
          onPress={() => navigation.navigate('Profile')}
          style={styles.purpleButton}
        />
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
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
            ListEmptyComponent={<Text style={styles.emptyText}>No bets yet. Create one!</Text>}
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
  betItem: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  betTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  betWager: {
    fontSize: 14,
    color: '#6b7280',
  },
  betStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  blueButton: { backgroundColor: '#2563eb', marginBottom: 12 },
  redButton: { backgroundColor: '#dc2626', marginBottom: 12 },
  greenButton: { backgroundColor: '#059669', marginBottom: 12 },
  yellowButton: { backgroundColor: '#d97706', marginBottom: 12 },
  purpleButton: { backgroundColor: '#7c3aed', marginBottom: 12 },
  loader: { flex: 1 },
  emptyText: { color: '#6b7280' },
});