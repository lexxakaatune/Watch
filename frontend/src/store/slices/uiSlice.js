import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    sidebarOpen: false,
    searchOpen: false,
    activeModal: null,
    toast: null,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, toggleSearch, setActiveModal, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
