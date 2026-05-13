export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PREMIUM: 'premium_user',
  CREATOR: 'creator',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: 0,
  [ROLES.USER]: 1,
  [ROLES.PREMIUM]: 2,
  [ROLES.CREATOR]: 3,
  [ROLES.MODERATOR]: 4,
  [ROLES.ADMIN]: 5,
  [ROLES.SUPERADMIN]: 6,
};

export const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const formatNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num?.toString() || '0';
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};
