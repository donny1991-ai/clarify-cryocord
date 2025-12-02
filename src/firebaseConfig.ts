// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7ZrmaM8I_15WRZgW35exRNP_t4__0HF8",
  authDomain: "cryocord-ai-platform.firebaseapp.com",
  projectId: "cryocord-ai-platform",
  storageBucket: "cryocord-ai-platform.firebasestorage.app",
  messagingSenderId: "1034418228298",
  appId: "1:1034418228298:web:2469008fc444cdae496ab3",
  measurementId: "G-WS1HS5RS5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional, only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
