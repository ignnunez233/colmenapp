// Equivalente a: home/HomeScreen.kt
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHiveStore } from '../store/hiveStore';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing } from '../theme/tokens';
import QueenStateBadge from '../components/QueenStateBadge';

export default function HomeScreen() {
  const router = useRouter();
  const hives = useHiveStore((s) => s.hives);
  const observeMyHives = useHiveStore((s) => s.observeMyHives);
  const authState = useAuthStore((s) => s.state);

  useEffect(() => {
    if (authState.status !== 'authenticated') return;
    const unsubscribe = observeMyHives(authState.uid);
    return () => unsubscribe();
  }, [authState, observeMyHives]);

  const isLoading = authState.status === 'authenticated' && hives.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis colmenas</Text>
        {/* router.push('/profile') navega al archivo app/profile.tsx */}
        <Pressable onPress={() => router.push('/profile')}>
          <Text style={styles.profileLink}>Perfil</Text>
        </Pressable>
      </View>

      <FlatList
        data={hives}
        keyExtractor={(item) => item.id ?? item.code}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            //> Ruta dinámica: navega al archivo app/hive/[id].tsx,
            //> reemplazando "[id]" por el id real de la colmena.
            //> Equivalente a navigation.navigate('Hive', { id }) del
            //> starter anterior, o a composable("hive/{id}") en Kotlin.
            onPress={() => item.id && router.push(`/hive/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCode}>{item.code}</Text>
            </View>
            <QueenStateBadge state={item.queenState} />
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
            : <Text style={styles.emptyText}>Aún no tienes colmenas registradas.</Text>
        }
      />

      <Pressable style={styles.addButton} onPress={() => router.push('/add-hive')}>
        <Text style={styles.addButtonText}>+ Agregar colmena</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.gap },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  profileLink: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.cardPadding, marginBottom: spacing.gap, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  cardCode: { fontSize: 13, color: colors.unknown },
  emptyText: { textAlign: 'center', color: colors.unknown, marginTop: 24 },
  addButton: { backgroundColor: colors.primary, borderRadius: radii.sm, paddingVertical: 14, alignItems: 'center' },
  addButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
