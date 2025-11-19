import { create } from "zustand";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const useUserStore = create((set, get) => ({
  // Initial state
  user: null,
  role: null,
  loading: true,

  // Actions
  setUser: (userData) => set({ user: userData }),
  setRole: (role) => set({ role }),
  clearUser: () => set({ user: null, role: null }),

  // Initialize Firebase auth listener. Returns unsubscribe function.
  initAuth: () => {
    set({ loading: true });
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userData = { uid: u.uid, email: u.email, name: u.name };
        set({ user: userData });
        // Try to fetch user role from Firestore `Users` collection (matches current DB)
        try {
          // Many existing pages query the `Users` collection where field `uid` == u.uid
          const usersRef = collection(db, "Users");
          const q = query(usersRef, where("uid", "==", u.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();
            set({ role: data.role || null });
            // also merge store user with any extra profile fields
            set({ user: { ...userData, id: userDoc.id, ...data } });
          } else {
            set({ role: null });
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          set({ role: null });
        }
      } else {
        set({ user: null, role: null });
      }
      set({ loading: false });
    });

    return unsubscribe;
  },

  signOutUser: async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
    set({ user: null, role: null });
  },
}));
