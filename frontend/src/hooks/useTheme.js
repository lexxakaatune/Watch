import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../store/slices/uiSlice';
import { useEffect } from 'react';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => dispatch(toggleTheme()),
    set: (t) => dispatch(setTheme(t)),
  };
};
