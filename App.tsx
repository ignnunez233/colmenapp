import React, { useEffect } from 'react';
import AppNav from './navigation/AppNav';
import { initAuthListener } from './store/authStore';
import { ensureChannels } from './reminders/notificationHelper';

export default function App() {
  //> Este useEffect corre UNA VEZ (array de dependencias vacío: []),
  //> al montar App.tsx — que solo se monta una vez en toda la vida de
  //> la app. Es el equivalente correcto al init{}/onCleared() del
  //> AuthViewModel original (ver la nota grande en store/authStore.ts).
  useEffect(() => {
    const unsubscribe = initAuthListener();

    //> Equivalente a ColmenasApp.onCreate() llamando a
    //> NotificationHelper.ensureChannels(this) al arrancar la app.
    ensureChannels();

    return () => unsubscribe();
  }, []);

  return <AppNav />;
}
