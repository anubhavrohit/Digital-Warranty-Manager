'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { UserProfile, WarrantyItem, DocumentItem } from '@/types';
import { getInitialDemoWarranties } from './warranty-utils';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  warranties: WarrantyItem[];
  documents: DocumentItem[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemoUser: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  addWarranty: (warrantyData: Omit<WarrantyItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<WarrantyItem>;
  updateWarranty: (id: string, warrantyData: Partial<WarrantyItem>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  addDocument: (docData: Omit<DocumentItem, 'id' | 'userId' | 'uploadedAt'>) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<void>;
  seedDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  uid: 'demo-user-123',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  createdAt: '2024-01-15T10:00:00.000Z',
};

const STORAGE_KEYS = {
  USER: 'vw_user',
  WARRANTIES: 'vw_warranties',
  DOCUMENTS: 'vw_documents',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            
            let profile: UserProfile;
            if (userSnap.exists()) {
              profile = userSnap.data() as UserProfile;
            } else {
              profile = {
                uid: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                email: fbUser.email || '',
                createdAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, profile);
            }
            setUser(profile);
            setIsDemoMode(false);
            await fetchFirebaseWarrantiesAndDocs(fbUser.uid);
          } catch (err) {
            console.error('Firestore user profile fetch error:', err);
            loadLocalStorageData();
          }
        } else {
          loadLocalStorageData();
        }
        setLoading(false);
      });
    } else {
      loadLocalStorageData();
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const getWarrantiesStorageKey = (uid: string) => `${STORAGE_KEYS.WARRANTIES}_${uid}`;
  const getDocsStorageKey = (uid: string) => `${STORAGE_KEYS.DOCUMENTS}_${uid}`;

  const loadLocalStorageData = async () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const isDemo = parsedUser.uid === DEMO_USER.uid;
        setIsDemoMode(isDemo);
        await loadUserWarrantiesAndDocs(parsedUser.uid, isDemo);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('LocalStorage load error', e);
      setUser(null);
    }
  };

  const loadUserWarrantiesAndDocs = async (userId: string, isDemoAccount: boolean = false) => {
    try {
      const wKey = getWarrantiesStorageKey(userId);
      const dKey = getDocsStorageKey(userId);

      let apiWarranties: WarrantyItem[] | null = null;
      let apiDocs: DocumentItem[] | null = null;

      try {
        const wRes = await fetch(`/api/warranties?userId=${encodeURIComponent(userId)}`);
        if (wRes.ok) {
          const data = await wRes.json();
          if (Array.isArray(data.warranties)) {
            apiWarranties = data.warranties;
          }
        }

        const dRes = await fetch(`/api/documents?userId=${encodeURIComponent(userId)}`);
        if (dRes.ok) {
          const data = await dRes.json();
          if (Array.isArray(data.documents)) {
            apiDocs = data.documents;
          }
        }
      } catch (err) {
        console.warn('API sync unavailable, falling back to client storage:', err);
      }

      // WARRANTIES SYNCHRONIZATION
      if (apiWarranties !== null) {
        const storedWarrantiesStr = localStorage.getItem(wKey);
        const storedWarranties: WarrantyItem[] = storedWarrantiesStr ? JSON.parse(storedWarrantiesStr) : [];

        if (apiWarranties.length === 0 && storedWarranties.length > 0) {
          // Sync local items (like TATA Tiago) to server DB so other browsers get it
          setWarranties(storedWarranties);
          for (const item of storedWarranties) {
            fetch('/api/warranties', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).catch(() => {});
          }
        } else if (apiWarranties.length === 0 && isDemoAccount) {
          const initial = getInitialDemoWarranties(userId);
          setWarranties(initial);
          localStorage.setItem(wKey, JSON.stringify(initial));
          for (const item of initial) {
            fetch('/api/warranties', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).catch(() => {});
          }
        } else {
          setWarranties(apiWarranties);
          localStorage.setItem(wKey, JSON.stringify(apiWarranties));
        }
      } else {
        const storedWarrantiesStr = localStorage.getItem(wKey);
        if (storedWarrantiesStr) {
          setWarranties(JSON.parse(storedWarrantiesStr));
        } else if (isDemoAccount) {
          const initial = getInitialDemoWarranties(userId);
          setWarranties(initial);
          localStorage.setItem(wKey, JSON.stringify(initial));
        } else {
          setWarranties([]);
        }
      }

      // DOCUMENTS SYNCHRONIZATION
      if (apiDocs !== null) {
        const storedDocsStr = localStorage.getItem(dKey);
        const storedDocs: DocumentItem[] = storedDocsStr ? JSON.parse(storedDocsStr) : [];

        if (apiDocs.length === 0 && storedDocs.length > 0) {
          setDocuments(storedDocs);
          for (const docItem of storedDocs) {
            fetch('/api/documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(docItem),
            }).catch(() => {});
          }
        } else {
          setDocuments(apiDocs);
          localStorage.setItem(dKey, JSON.stringify(apiDocs));
        }
      } else {
        const storedDocsStr = localStorage.getItem(dKey);
        if (storedDocsStr) {
          setDocuments(JSON.parse(storedDocsStr));
        } else {
          setDocuments([]);
        }
      }
    } catch (e) {
      console.error('Local data initialization error', e);
    }
  };

  const fetchFirebaseWarrantiesAndDocs = async (userId: string) => {
    try {
      const wQuery = query(collection(db, 'warranties'), where('userId', '==', userId));
      const wSnap = await getDocs(wQuery);
      const wList: WarrantyItem[] = [];
      wSnap.forEach((docSnap) => {
        wList.push({ id: docSnap.id, ...docSnap.data() } as WarrantyItem);
      });
      setWarranties(wList);

      const dQuery = query(collection(db, 'documents'), where('userId', '==', userId));
      const dSnap = await getDocs(dQuery);
      const dList: DocumentItem[] = [];
      dSnap.forEach((docSnap) => {
        dList.push({ id: docSnap.id, ...docSnap.data() } as DocumentItem);
      });
      setDocuments(dList);
    } catch (err) {
      console.error('Error fetching Firestore data, using local fallback:', err);
      await loadUserWarrantiesAndDocs(userId, false);
    }
  };

  const login = async (email: string, pass: string) => {
    let firebaseSuccess = false;
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        firebaseSuccess = true;
      } catch (err) {
        console.warn('Firebase login attempt failed or unconfigured, proceeding with server session:', err);
      }
    }

    if (!firebaseSuccess) {
      const cleanUid = 'user-' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const profile: UserProfile = {
        uid: cleanUid,
        name: email.split('@')[0] || 'User',
        email: email,
        createdAt: new Date().toISOString(),
      };

      // Sync user to server DB
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.user) profile.name = resData.user.name;
        }
      } catch (e) {}

      setUser(profile);
      setIsDemoMode(false);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      await loadUserWarrantiesAndDocs(profile.uid, false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    let firebaseSuccess = false;
    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const profile: UserProfile = {
          uid: res.user.uid,
          name,
          email,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', res.user.uid), profile);
        setUser(profile);
        firebaseSuccess = true;
      } catch (err) {
        console.warn('Firebase register attempt failed or unconfigured, proceeding with server session:', err);
      }
    }

    if (!firebaseSuccess) {
      const cleanUid = 'user-' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const profile: UserProfile = {
        uid: cleanUid,
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      } catch (e) {}

      setUser(profile);
      setIsDemoMode(false);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      await loadUserWarrantiesAndDocs(profile.uid, false);
    }
  };

  const loginAsDemoUser = async () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    await loadUserWarrantiesAndDocs(DEMO_USER.uid, true);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && !isDemoMode) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Password reset email sent to ${email}`);
    }
  };

  const updateProfileName = async (name: string) => {
    if (!user) return;
    const updated = { ...user, name };
    setUser(updated);

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, name }),
      });
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      await updateDoc(doc(db, 'users', user.uid), { name });
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  };

  const addWarranty = async (
    data: Omit<WarrantyItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<WarrantyItem> => {
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const newItem: WarrantyItem = {
      ...data,
      id: 'w-' + Date.now(),
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.warranty) newItem.id = resData.warranty.id;
      }
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      try {
        const docRef = await addDoc(collection(db, 'warranties'), {
          ...data,
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
        newItem.id = docRef.id;
      } catch (e) {
        console.error('Firestore save failed:', e);
      }
    }

    const updatedWarranties = [newItem, ...warranties];
    setWarranties(updatedWarranties);
    localStorage.setItem(getWarrantiesStorageKey(user.uid), JSON.stringify(updatedWarranties));
    return newItem;
  };

  const updateWarranty = async (id: string, data: Partial<WarrantyItem>) => {
    if (!user) return;
    const updated = warranties.map((w) =>
      w.id === id ? { ...w, ...data, updatedAt: new Date().toISOString() } : w
    );
    setWarranties(updated);
    localStorage.setItem(getWarrantiesStorageKey(user.uid), JSON.stringify(updated));

    try {
      await fetch('/api/warranties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      try {
        await updateDoc(doc(db, 'warranties', id), {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Firestore update error', e);
      }
    }
  };

  const deleteWarranty = async (id: string) => {
    if (!user) return;
    const updated = warranties.filter((w) => w.id !== id);
    setWarranties(updated);
    localStorage.setItem(getWarrantiesStorageKey(user.uid), JSON.stringify(updated));

    try {
      await fetch(`/api/warranties?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'warranties', id));
      } catch (e) {
        console.error('Firestore delete error', e);
      }
    }
  };

  const addDocument = async (
    data: Omit<DocumentItem, 'id' | 'userId' | 'uploadedAt'>
  ): Promise<DocumentItem> => {
    if (!user) throw new Error('User not authenticated');

    const newDocItem: DocumentItem = {
      ...data,
      id: 'doc-' + Date.now(),
      userId: user.uid,
      uploadedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocItem),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.document) newDocItem.id = resData.document.id;
      }
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      try {
        const docRef = await addDoc(collection(db, 'documents'), {
          ...data,
          userId: user.uid,
          uploadedAt: new Date().toISOString(),
        });
        newDocItem.id = docRef.id;
      } catch (e) {
        console.error('Firestore doc add error', e);
      }
    }

    const updatedDocs = [newDocItem, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem(getDocsStorageKey(user.uid), JSON.stringify(updatedDocs));
    return newDocItem;
  };

  const deleteDocument = async (id: string) => {
    if (!user) return;
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem(getDocsStorageKey(user.uid), JSON.stringify(updated));

    try {
      await fetch(`/api/documents?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {}

    if (isFirebaseConfigured && auth && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (e) {
        console.error('Firestore doc delete error', e);
      }
    }
  };

  const seedDemoData = () => {
    if (!user) return;
    const initial = getInitialDemoWarranties(user.uid);
    setWarranties(initial);
    localStorage.setItem(getWarrantiesStorageKey(user.uid), JSON.stringify(initial));
    for (const item of initial) {
      fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        warranties,
        documents,
        login,
        register,
        loginAsDemoUser,
        logout,
        resetPassword,
        updateProfileName,
        addWarranty,
        updateWarranty,
        deleteWarranty,
        addDocument,
        deleteDocument,
        seedDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
