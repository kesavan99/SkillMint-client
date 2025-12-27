import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User,
  type UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Sign in with Google using popup and save to backend
 * @returns Promise with user credentials
 */
export const signInWithGooglePopup = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with Google using redirect
 * Use this for mobile devices where popup might not work well
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    throw error;
  }
};

/**
 * Get the result of a redirect sign-in
 * Call this on page load to check if user just completed redirect sign-in
 */
export const getGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 * @param callback Function to call when auth state changes
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

/**
 * Create a new user with email and password and send verification email
 * @param email User's email
 * @param verificationUrl Custom verification URL to include in email
 * @returns Promise with user credentials
 */
export const createUserWithEmail = async (email: string, verificationUrl: string): Promise<UserCredential> => {
  try {
    
    // Create user in Firebase with a temporary password
    const tempPassword = 'TempPassword123!';
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    
    // Send verification email with custom URL
    const actionCodeSettings = {
      url: verificationUrl,
      handleCodeInApp: true,
    };
    
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    
    return userCredential;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Send password reset email using Firebase's password reset template
 * @param email User's email
 * @param resetUrl Custom reset URL to include in email (will be used as continueUrl)
 */
export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  try {
    
    // Use Firebase's proper password reset email with custom action URL
    const actionCodeSettings = {
      url: resetUrl,
      handleCodeInApp: true,
    };
    
    await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    
  } catch (error: any) {
    // Re-throw to let caller handle the error
    throw error;
  }
};
