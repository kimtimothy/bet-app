import 'nativewind';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BetListScreen from './src/screens/BetListScreen';
import CreateBetScreen from './src/screens/CreateBetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchUsersScreen from './src/screens/SearchUsersScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import { setAuthToken } from './src/services/api';
import { supabase, debugStorage } from './src/services/supabase';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Bets: undefined;
  CreateBet: { opponentId?: string } | undefined;
  Profile: undefined;
  SearchUsers: undefined;
  Friends: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      // Wait a bit for Supabase to initialize and restore session from storage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First, try to get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session check:', { session: !!session, error });
      
      if (session && !error) {
        // User has a valid session, set the token and mark as authenticated
        const accessToken = session.access_token;
        await AsyncStorage.setItem('token', accessToken);
        setAuthToken(accessToken);
        setIsAuthenticated(true);
        console.log('User authenticated via session');
      } else {
        // No valid session, check if we have a stored token as fallback
        const token = await AsyncStorage.getItem('token');
        console.log('No session, checking stored token:', !!token);
        
        if (token) {
          // Try to validate the stored token
          setAuthToken(token);
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && !userError) {
            // Token is still valid
            setIsAuthenticated(true);
            console.log('User authenticated via stored token');
          } else {
            // Token is invalid, clear it
            await AsyncStorage.removeItem('token');
            setAuthToken(null);
            setIsAuthenticated(false);
            console.log('Stored token invalid, cleared');
          }
        } else {
          setIsAuthenticated(false);
          console.log('No stored token found');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, clear any stored tokens and assume not authenticated
      await AsyncStorage.removeItem('token');
      setAuthToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Starting auth initialization...');
      
      try {
        // Debug: Check what's in AsyncStorage
        await debugStorage();
        
        // Wait a moment for Supabase to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check result:', { hasSession: !!session, error });
        
        if (session && !error) {
          console.log('Found valid session, setting authenticated');
          const accessToken = session.access_token;
          await AsyncStorage.setItem('token', accessToken);
          setAuthToken(accessToken);
          setIsAuthenticated(true);
        } else {
          console.log('No valid session found, checking stored token...');
          
          // Fallback: check if we have a stored token
          const token = await AsyncStorage.getItem('token');
          if (token) {
            console.log('Found stored token, trying to validate...');
            setAuthToken(token);
            
            // Try to get user info with the token
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (user && !userError) {
              console.log('Stored token is valid, setting authenticated');
              setIsAuthenticated(true);
            } else {
              console.log('Stored token is invalid, clearing...');
              await AsyncStorage.removeItem('token');
              setAuthToken(null);
              setIsAuthenticated(false);
            }
          } else {
            console.log('No stored token found');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        
        if (event === 'SIGNED_IN' && session) {
          // User signed in
          const accessToken = session.access_token;
          await AsyncStorage.setItem('token', accessToken);
          setAuthToken(accessToken);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          await AsyncStorage.removeItem('token');
          setAuthToken(null);
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token was refreshed
          const accessToken = session.access_token;
          await AsyncStorage.setItem('token', accessToken);
          setAuthToken(accessToken);
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Bets" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Sign Up' }}
        />
        <Stack.Screen
          name="Bets"
          component={BetListScreen}
          options={{ title: 'My Bets', headerLeft: () => null }}
        />
        <Stack.Screen
          name="CreateBet"
          component={CreateBetScreen}
          options={{ title: 'Create Bet' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="SearchUsers"
          component={SearchUsersScreen}
          options={{ title: 'Find Friends' }}
        />
        <Stack.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ title: 'Friends' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});