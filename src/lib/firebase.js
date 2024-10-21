import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyB2TTMM8HDPSHYSHEAngl0eBJGFHIUExbE",
authDomain: "vercel-sveltekit-gotw.firebaseapp.com",
projectId: "vercel-sveltekit-gotw",
storageBucket: "vercel-sveltekit-gotw.appspot.com",
messagingSenderId: "1021585576074",
appId: "1:1021585576074:web:fccb6d7278c897e0e55d73"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);