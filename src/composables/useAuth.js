import { ref, onMounted, onUnmounted } from 'vue';
import { authService } from '../services/firebase.js';

const user = ref(null);
const isLoading = ref(true);

export function useAuth() {
  let unsubscribe = null;

  const initAuth = () => {
    unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      user.value = firebaseUser;
      isLoading.value = false;
    });
  };

  const login = async (email, password) => {
    try {
      isLoading.value = true;
      const firebaseUser = await authService.login(email, password);
      user.value = firebaseUser;
      return firebaseUser;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (email, password, displayName) => {
    try {
      isLoading.value = true;
      const firebaseUser = await authService.register(email, password, displayName);
      user.value = firebaseUser;
      return firebaseUser;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      user.value = null;
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user.value;
  };

  onMounted(() => {
    if (!unsubscribe) {
      initAuth();
    }
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    initAuth
  };
}
