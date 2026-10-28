// Equivalente a: nav/AppNav.kt
//
//> CAMBIO DE PARADIGMA respecto al starter anterior (React Navigation
//> manual): acá NO se declara "<Stack.Screen name="Login">" a mano.
//> Expo Router ya sabe qué pantallas existen mirando los archivos
//> dentro de app/ (login.tsx, register.tsx, home.tsx, etc.). Este
//> archivo especial, _layout.tsx, solo envuelve TODAS esas pantallas
//> con configuración común (acá: ocultar el header) y aloja la lógica
//> de "redirigir según sesión" con el listener de auth.
//>
//> Equivalente a MainActivity.setContent { ColmenasTheme { AppNav() } }:
//> este es, en la práctica, el punto de entrada de toda la UI.

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initAuthListener } from '../store/authStore';
import { ensureChannels } from '../reminders/notificationHelper';

export default function RootLayout() {
  //> Equivalente a App.tsx en el starter anterior. Con Expo Router,
  //> este efecto "de una sola vez al iniciar la app" vive en
  //> _layout.tsx en vez de en App.tsx, porque _layout.tsx ES el
  //> archivo raíz que se monta una sola vez.
  useEffect(() => {
    const unsubscribe = initAuthListener();
    ensureChannels(); // equivalente a ColmenasApp.onCreate()
    return () => unsubscribe();
  }, []);

  //> screenOptions={{headerShown:false}} de React Navigation equivale
  //> acá a pasar el mismo objeto directo como prop de <Stack>.
  //> Cada pantalla sigue pudiendo pisar esto individualmente si hiciera
  //> falta un header particular en algún archivo (no es el caso acá).
  return <Stack screenOptions={{ headerShown: false }} />;
}
