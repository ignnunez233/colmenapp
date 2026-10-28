// Equivalente a: data/firebase/FirebaseModules.kt
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

export const db = firestore;
export const fbAuth = auth;
export const fbStorage = storage;
