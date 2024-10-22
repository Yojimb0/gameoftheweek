import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";

// INIT
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


// AUTH
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};


// GROUPS
export const db = getFirestore(app);
export const createGroup = async (groupName: string, userId: string): Promise<string> => {
  const groupRef = await addDoc(collection(db, "groups"), {
    name: groupName,
    owner: userId,
    members: [userId] // Add the creator as the first member
  });
  return groupRef.id; // Return the unique ID of the created group
};

export const joinGroup = async (groupId: string, userId: string): Promise<void> => {
  const groupRef = doc(db, "groups", groupId);
  await updateDoc(groupRef, {
    members: arrayUnion(userId) // Add the user to the group members
  });
};

export const getUserGroups = async (userId: string): Promise<any[]> => {
  const groupsRef = collection(db, "groups");
  const q = query(groupsRef, where("members", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  
  const userGroups: any[] = [];
  querySnapshot.forEach((doc) => {
    userGroups.push({ id: doc.id, ...doc.data() });
  });
  return userGroups; // Return array of groups the user belongs to
};
