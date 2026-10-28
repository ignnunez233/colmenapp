// Equivalente a: home/HomeScreen.kt
//
//> Patrón nuevo importante: "observeMyHives" retorna una función de
//> unsubscribe (ver la nota grande en store/hiveStore.ts). El lugar
//> correcto para iniciar la suscripción y garantizar que se cierre es
//> useEffect con función de cleanup — es el equivalente RN a que el
//> ViewModel cancelara el Flow en su onCleared().
//>
//> En Kotlin esto era invisible: "LaunchedEffect(Unit) { vm.observeMyHives(uid) }"
//> y listo, porque viewModelScope se encargaba de cancelar solo.
//> En React, ese "se encargaba solo" HAY que escribirlo a mano.

import React, { useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useHiveStore } from '../store/hiveStore';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing } from '../theme/tokens';
import QueenStateBadge from '../components/QueenStateBadge';

interface Props {
  onAdd: () => void;
  onOpen: (id: string) => void;
  onProfile: () => void;
}

export default function HomeScreen({ onAdd, onOpen, onProfile }: Props) {
  const hives = useHiveStore((s) => s.hives);
  const observeMyHives = useHiveStore((s) => s.observeMyHives);
  const authState = useAuthStore((s) => s.state);

  useEffect(() => {
    if (authState.status !== 'authenticated') return;

    //> Se guarda la función que retorna observeMyHives y se devuelve
    //> dentro del cleanup de useEffect: React la ejecuta automáticamente
    //> al desmontar el componente o antes de re-ejecutar el efecto.
    const unsubscribe = observeMyHives(authState.uid);
    return () => unsubscribe();
  }, [authState, observeMyHives]);

  const isLoading = authState.status === 'authenticated' && hives.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis colmenas</Text>
        <Button title="Perfil" onPress={onProfile} color={colors.primary} />
      </View>

      <FlatList
        data={hives}
        keyExtractor={(item) => item.id ?? item.code}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => item.id && onOpen(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCode}>{item.code}</Text>
            </View>
            <QueenStateBadge state={item.queenState} />
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
          ) : (
            <Text style={styles.emptyText}>Aún no tienes colmenas registradas.</Text>
          )
        }
      />

      <Pressable style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Agregar colmena</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.gap,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.cardPadding,
    marginBottom: spacing.gap,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  cardCode: { fontSize: 13, color: colors.unknown },
  emptyText: { textAlign: 'center', color: colors.unknown, marginTop: 24 },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
