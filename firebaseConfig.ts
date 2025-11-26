import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- INSTRUÇÕES ---
// 1. Vá para console.firebase.google.com
// 2. Crie um projeto novo.
// 3. Adicione um app Web (ícone </>).
// 4. Copie o objeto 'firebaseConfig' que eles mostram e substitua abaixo.

const firebaseConfig = {
  apiKey: "AIzaSyBQ4-_GHeOnQYMPw4mE3ZfGVVBG94SLSzQ",
  authDomain: "gestaodeplataformas01.firebaseapp.com",
  projectId: "gestaodeplataformas01",
  storageBucket: "gestaodeplataformas01.firebasestorage.app",
  messagingSenderId: "962803871710",
  appId: "1:962803871710:web:797afbacb7ca2668e1374f",
  measurementId: "G-W8HX9F82K4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);