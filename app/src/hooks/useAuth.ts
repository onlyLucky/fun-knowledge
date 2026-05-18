import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
