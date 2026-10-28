// Equivalente a: reminders/NotificationHelper.kt
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CH_HIVE_REMINDERS = 'hive_reminders';

export async function ensureChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CH_HIVE_REMINDERS, {
      name: 'Recordatorios Colmenas',
      description: 'Alertas periódicas y personalizadas de colmenas',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
