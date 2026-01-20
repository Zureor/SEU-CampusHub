import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export type UserRole = 'student' | 'admin' | 'super-user' | null;

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  phone?: string;
  bio?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, studentId?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperUser: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Firebase Auth state with Firestore Profile
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }

        if (firebaseUser) {
          // Listen to profile changes in real-time
          const userRef = doc(db, 'users', firebaseUser.uid);

          unsubscribeSnapshot = onSnapshot(userRef, async (userDoc) => {
            if (userDoc.exists()) {
              const existingProfile = userDoc.data();

              // Auto-promote super user email if not already super-user
              setUser({
                id: firebaseUser.uid,
                email: existingProfile.email,
                name: existingProfile.name,
                avatar: existingProfile.avatar,
                studentId: existingProfile.studentId,
                role: existingProfile.role,
                phone: existingProfile.phone,
                bio: existingProfile.bio
              });
            } else {
              // Create default profile if it doesn't exist
              const newProfile: UserProfile = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                role: 'student',
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                phone: '',
                bio: ''
              };
              await setDoc(userRef, newProfile);
              // Snapshot will fire after setDoc
            }
            setIsLoading(false);
          }, (error) => {
            console.error("Snapshot error:", error);
            setIsLoading(false);
          });

        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Profile handled by onAuthStateChanged effect
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, studentId?: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create Firestore profile immediately
      // SECURITY: Always default to 'student' role. Admin/Super-user roles must be assigned manually in Firestore console.
      const newProfile: UserProfile = {
        id: result.user.uid,
        email,
        name,
        role: 'student',
        studentId: studentId || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      };

      await setDoc(doc(db, 'users', result.user.uid), newProfile);
      setUser(newProfile);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      isAdmin: user?.role === 'admin' || user?.role === 'super-user',
      isSuperUser: user?.role === 'super-user',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
