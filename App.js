import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import StoreScreen from './src/screens/StoreScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SellerScreen from './src/screens/SellerScreen';
import NewProductScreen from './src/screens/NewProductScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary },
};

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;
const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
};

function ClientTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Início" component={HomeScreen} options={{ tabBarIcon: icon('flower-outline') }} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} options={{ tabBarIcon: icon('receipt-outline') }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}

function VendorTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Pedidos" component={OrdersScreen} options={{ tabBarIcon: icon('receipt-outline') }} />
      <Tab.Screen name="Minha loja" component={SellerScreen} options={{ tabBarIcon: icon('storefront-outline') }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}

function Tabs() {
  const { isVendor } = useApp();
  return isVendor ? <VendorTabs /> : <ClientTabs />;
}

function Routes() {
  const { user, booting, isVendor } = useApp();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Pedido' }} />
          {isVendor ? (
            <>
              <Stack.Screen name="NewProduct" component={NewProductScreen} options={{ title: 'Produto' }} />
              <Stack.Screen name="EditStore" component={EditStoreScreen} options={{ title: 'Perfil da loja' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Store" component={StoreScreen} options={{ title: 'Floricultura' }} />
              <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar pedido' }} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Routes />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
