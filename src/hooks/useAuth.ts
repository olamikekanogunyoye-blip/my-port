/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { OWNER_EMAIL } from '../config/owner';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  simulateOwnerAuthForTesting?: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkIsOwner = useCallback((candidateEmail: string | null | undefined, isVerified: boolean) => {
    if (!candidateEmail) return false;
    return (
      candidateEmail.toLowerCase().trim() === OWNER_EMAIL.toLowerCase().trim() &&
      isVerified === true
    );
  }, []);

  const isOwner = Boolean(user && checkIsOwner(user.email, user.emailVerified));

  useEffect(() => {
    const testSession = sessionStorage.getItem('kod_test_auth_user');
    if (testSession) {
      try {
        const parsed = JSON.parse(testSession);
        setUser(parsed);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem('kod_test_auth_user');
      }
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setLoading(true);
      setError(null);

      if (fbUser) {
        const candidateEmail = fbUser.email;
        const verified = fbUser.emailVerified;

        if (checkIsOwner(candidateEmail, verified)) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            emailVerified: fbUser.emailVerified,
          });
        } else {
          if (auth) {
            await firebaseSignOut(auth);
          }
          setUser(null);
          setError('Access restricted to verified owner account.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkIsOwner]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not yet linked to a cloud project.');
      setLoading(false);
      return false;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const candidateUser = result.user;

      if (!checkIsOwner(candidateUser.email, candidateUser.emailVerified)) {
        await firebaseSignOut(auth);
        setUser(null);
        setError(`Access denied. Account ${candidateUser.email || ''} is not authorized.`);
        setLoading(false);
        return false;
      }

      setUser({
        uid: candidateUser.uid,
        email: candidateUser.email,
        displayName: candidateUser.displayName,
        photoURL: candidateUser.photoURL,
        emailVerified: candidateUser.emailVerified,
      });
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Authentication Error:', err);
      setError(err instanceof Error ? err.message : 'Google sign-in was aborted.');
      setLoading(false);
      return false;
    }
  }, [checkIsOwner]);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem('kod_test_auth_user');
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setError(null);
  }, []);

  const simulateOwnerAuthForTesting = useCallback(() => {
    const mockOwner: AuthUser = {
      uid: 'owner_test_uid_001',
      email: OWNER_EMAIL,
      displayName: 'Olamilekan Ogunyoye David',
      photoURL: null,
      emailVerified: true,
    };
    sessionStorage.setItem('kod_test_auth_user', JSON.stringify(mockOwner));
    setUser(mockOwner);
    setError(null);
  }, []);

  return {
    user,
    isOwner,
    loading,
    error,
    signInWithGoogle,
    signOut,
    simulateOwnerAuthForTesting,
  };
}
