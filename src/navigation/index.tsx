import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppTheme } from '../hooks/useColorScheme';
import { HomeScreen } from '../screens/HomeScreen';
import { MasterListScreen } from '../screens/MasterListScreen';
import { StockEntryScreen } from '../screens/StockEntryScreen';
import { ShoppingListsScreen } from '../screens/ShoppingListsScreen';
import { ShoppingListDetailScreen } from '../screens/ShoppingListDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AutocompleteHistoryScreen } from '../screens/AutocompleteHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#ffffff',
    border: '#222222',
    primary: '#10b981',
    notification: '#10b981',
  },
};

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    primary: '#059669',
    notification: '#059669',
  },
};

export function RootNavigator() {
  const { isDark } = useAppTheme();

  return (
    <NavigationContainer theme={isDark ? MyDarkTheme : MyLightTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MasterList" component={MasterListScreen} />
        <Stack.Screen name="StockEntry" component={StockEntryScreen} />
        <Stack.Screen name="ShoppingLists" component={ShoppingListsScreen} />
        <Stack.Screen name="ShoppingListDetail" component={ShoppingListDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AutocompleteHistory" component={AutocompleteHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
