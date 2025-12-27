import { useState, useEffect } from 'react';
import { moderationService } from '@/services/moderationService';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        const access = await moderationService.checkModeratorAccess();
        setIsAdmin(access.isAdmin);
        setIsModerator(access.isModerator);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  return { isAdmin, isModerator, loading };
};
