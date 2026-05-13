import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated, loading, error, requires2FA } = useSelector((state) => state.auth);
  return { user, isAuthenticated, loading, error, requires2FA };
};

export const useRole = () => {
  const { user } = useSelector((state) => state.auth);
  return {
    role: user?.role || 'guest',
    isGuest: !user,
    isUser: user?.role === 'user',
    isPremium: user?.role === 'premium_user',
    isCreator: user?.role === 'creator',
    isModerator: user?.role === 'moderator',
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin',
    isStaff: ['moderator', 'admin', 'superadmin'].includes(user?.role),
  };
};
