import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCF5OWjn7iI51uKxjkrLHnvI9ks-v8p-3s",
    authDomain: "advance-todo-app-980a6.firebaseapp.com",
    projectId: "advance-todo-app-980a6",
    storageBucket: "advance-todo-app-980a6.firebasestorage.app",
    messagingSenderId: "521294570293",
    appId: "1:521294570293:web:7323943fdae36289ffe27c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };


