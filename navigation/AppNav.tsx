// Equivalente a: nav/AppNav.kt (proyecto Android original)
//
// Dependencias requeridas:
// npx expo install @react-navigation/native @react-navigation/native-stack
// npx expo install react-native-screens react-native-safe-area-context

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddHiveScreen from '../screens/AddHiveScreen';
import HiveDetailScreen from '../screens/HiveDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuthStore } from '../store/authStore';

// Equivalente al "object Routes" de Kotlin
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Add: undefined;
  Profile: undefined;
  Hive: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNav() {
  const authState = useAuthStore((s) => s.state);

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Equivalente a la reacción por LaunchedEffect(state) en Kotlin:
        // decide la pantalla inicial según el estado de auth. Si ya hay
        // sesión, se salta la bienvenida y va directo a Home.
        initialRouteName={
          authState.status === 'authenticated' ? 'Home' : 'Welcome'
        }
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome">
          {({ navigation }) => (
            <WelcomeScreen
              onGoLogin={() => navigation.navigate('Login')}
              onGoRegister={() => navigation.navigate('Register')}
              // Acceso rápido de desarrollo — quitar el prop onGoHome
              // (o todo el bloque en WelcomeScreen.tsx) cuando Auth
              // esté terminado y probado de punta a punta.
              onGoHome={() => navigation.navigate('Home')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen onGoRegister={() => navigation.navigate('Register')} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {({ navigation }) => (
            <RegisterScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              onAdd={() => navigation.navigate('Add')}
              onOpen={(id) => navigation.navigate('Hive', { id })}
              onProfile={() => navigation.navigate('Profile')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Add">
          {({ navigation }) => (
            <AddHiveScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Profile">
          {({ navigation }) => (
            <ProfileScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Hive">
          {({ navigation, route }) => (
            <HiveDetailScreen
              hiveId={route.params.id}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

