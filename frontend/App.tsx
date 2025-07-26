import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BetListScreen from './src/screens/BetListScreen';
import CreateBetScreen from './src/screens/CreateBetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchUsersScreen from './src/screens/SearchUsersScreen';
import FriendsScreen from './src/screens/FriendsScreen';

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
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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