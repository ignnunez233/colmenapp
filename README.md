# ColmenasApp RN — Arquitectura con Expo Router

Este proyecto utiliza **Expo Router** como sistema de navegación principal. La configuración del punto de entrada en `package.json` está establecida en `"main": "expo-router/entry"`.

## Instalación de dependencias

Para instalar las dependencias requeridas para el estado global y la integración con Firebase, se deben ejecutar los siguientes comandos:

```bash
npm install zustand
npx expo install @react-native-firebase/app @react-native-firebase/auth
npx expo install @react-native-firebase/firestore @react-native-firebase/storage
```

*Nota: Las dependencias de `@react-native-firebase` están preparadas para los módulos de autenticación, base de datos y almacenamiento de la aplicación.*

## Pasos para la integración

1. Limpiar el contenido por defecto del directorio `app/` (archivos como `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/_layout.tsx`).
2. Copiar los directorios del proyecto (`app/`, `types/`, `theme/`, `components/`, `store/`, `data/`, `audio/`, `reminders/`, `api/`, `firebase/`) a la raíz de la aplicación.
3. Ejecutar `npx expo start` para iniciar el servidor de desarrollo y verificar el flujo de navegación.

## Mapeo de rutas

| Ruta (URL) | Archivo | Pantalla |
|---|---|---|
| `/` | `app/index.tsx` | Redirección según el estado de sesión |
| `/welcome` | `app/welcome.tsx` | Pantalla de bienvenida |
| `/login` | `app/login.tsx` | Inicio de sesión |
| `/register` | `app/register.tsx` | Registro de usuario |
| `/home` | `app/home.tsx` | Listado de colmenas |
| `/add-hive` | `app/add-hive.tsx` | Formulario para agregar colmena |
| `/profile` | `app/profile.tsx` | Perfil de usuario |
| `/hive/[id]` | `app/hive/[id].tsx` | Detalle de colmena (ruta dinámica) |

El archivo `app/_layout.tsx` funciona como contenedor global que envuelve todas las rutas y gestiona el listener de autenticación al iniciar la aplicación.

## Conceptos clave de navegación

1. **Navegación basada en el sistema de archivos:** La estructura interna del directorio `app/` define automáticamente las rutas de la aplicación sin necesidad de un archivo de configuración centralizado.
2. **Navegación programática:** La transición entre pantallas se realiza mediante `router.push('/ruta')` utilizando el hook `useRouter()`.
3. **Parámetros dinámicos:** Se definen en los nombres de archivo mediante corchetes (por ejemplo, `app/hive/[id].tsx`). Se accede a ellos desde el componente mediante `useLocalSearchParams<{ id: string }>()`.

## Funcionalidades pendientes

- Implementación de la subida de archivos de audio a Firebase Storage.
- Eliminación del acceso directo temporal ("Ir directo a Mis colmenas →") en `welcome.tsx` una vez completada la validación del flujo de autenticación.
