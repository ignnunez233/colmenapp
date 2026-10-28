// Equivalente a: reminders/ReminderScheduler.kt + los 3 Workers
import * as Notifications from 'expo-notifications';
import {
  CH_HIVE_REMINDERS,
  ensureChannels,
  requestNotificationPermission,
} from './notificationHelper';

interface ScheduleResult {
  ok: boolean;
  notificationId?: string;
  error?: string;
}

function normalizeHiveName(hiveName: string): string {
  const trimmed = hiveName.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : 'la colmena';
}

async function scheduleReminder(
  title: string,
  body: string,
  secondsFromNow: number
): Promise<ScheduleResult> {
  const granted = await requestNotificationPermission();
  if (!granted) return { ok: false, error: 'Permiso de notificaciones denegado' };
  await ensureChannels();

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, secondsFromNow),
        channelId: CH_HIVE_REMINDERS,
      },
    });
    return { ok: true, notificationId };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Error al programar recordatorio';
    return { ok: false, error };
  }
}

export function scheduleSoftReview(hiveName: string): Promise<ScheduleResult> {
  const name = normalizeHiveName(hiveName);
  return scheduleReminder('Revisión suave', `Es momento de una revisión suave en ${name}.`, 60 * 60 * 24 * 3);
}

export function scheduleHardReview(hiveName: string): Promise<ScheduleResult> {
  const name = normalizeHiveName(hiveName);
  return scheduleReminder('Revisión dura', `Es momento de una revisión dura en ${name}.`, 60 * 60 * 24 * 5);
}

export function scheduleCustomReminder(hiveName: string, minutes: number): Promise<ScheduleResult> {
  const name = normalizeHiveName(hiveName);
  return scheduleReminder('Recordatorio personalizado', `Recordatorio para ${name}.`, minutes * 60);
}

export function cancelReminder(notificationId: string): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(notificationId);
}
