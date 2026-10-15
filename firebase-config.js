// firebase-config.js - Configuración oficial de Firebase para Xiomara AI
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Configuración pública de tu proyecto en Firebase[cite: 15]
export const firebaseConfig = {
  apiKey: "AIzaSyBh7_geKnVSjSrkJNRXztSYy1LNIaEGbCA",
  authDomain: "xiomara-ai.firebaseapp.com",
  projectId: "xiomara-ai",
  storageBucket: "xiomara-ai.firebasestorage.app",
  messagingSenderId: "299195414015",
  appId: "1:299195414015:web:e45dc683c8f637f2c8e3ca"
};

// Verificación de configuración lista
export const firebaseListo = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Inicialización de la App y de la Base de Datos Firestore
export const app = firebaseListo ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;