// Reemplaza la plantilla starter de create-expo-app.
//
//> Este archivo es la ruta raíz ("/") de toda la app — es lo primero
//> que se monta al abrir ColmenasAppRN. Su único trabajo es decidir
//> a dónde mandar a la persona, seguiendo el mismo flujo que decidía
//> "initialRouteName" en AppNav.kt/AppNav.tsx (versión anterior):
//>
//>   - Mientras Firebase todavía no responde -> pantalla de carga
//>   - Sesión activa                          -> /home
//>   - Sin sesión                              -> /welcome
//>
//> <Redirect> es el equivalente declarativo a que un ViewModel
//> dijera "navController.navigate(Routes.HOME)" al arrancar: en vez
//> de llamar una función de navegación de forma imperativa, se
//> "declara" a dónde debería estar la app dado el estado actual, y
//> Expo Router hace el cambio de pantalla por su cuenta.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/tokens';

export default function Index() {
  const authState = useAuthStore((s) => s.state);

  if (authState.status === 'loading') {
    //> Mientras onAuthStateChanged no ha respondido ni una vez, no se
    //> sabe todavía si hay sesión o no. Redirigir en este momento
    //> podría mandar a alguien con sesión activa de vuelta a Welcome
    //> por error. Se muestra una carga breve en su lugar, equivalente
    //> al viejo SplashScreen del starter anterior.
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (authState.status === 'authenticated') {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
});
