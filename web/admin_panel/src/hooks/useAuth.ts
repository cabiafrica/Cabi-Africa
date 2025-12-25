import { useAuthContext } from '../AuthContext';

/**
 * This hook provides a bridge between the AuthContext and components like ProtectedRoute
 * that need a simplified view of the auth state, including the role.
 */
export const useAuth = () => {
  const { isAuthenticated, user, login, logout, updateUser } = useAuthContext();

  return { isAuthenticated, role: user?.role, user, login, logout, updateUser };
};