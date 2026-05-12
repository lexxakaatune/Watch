import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export { api }

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch user')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload.user; state.isAuthenticated = true })
      .addCase(fetchMe.rejected, (state) => { state.user = null; state.isAuthenticated = false })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.isAuthenticated = false })
  }
})

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: localStorage.getItem('watch-theme') || 'dark' },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('watch-theme', state.mode)
      document.documentElement.setAttribute('data-theme', state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('watch-theme', state.mode)
      document.documentElement.setAttribute('data-theme', state.mode)
    }
  }
})

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false, alert: null, searchQuery: '' },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setAlert: (state, action) => { state.alert = action.payload },
    clearAlert: (state) => { state.alert = null },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload }
  }
})

export const { clearError } = authSlice.actions
export const { toggleTheme, setTheme } = themeSlice.actions
export const { toggleSidebar, setAlert, clearAlert, setSearchQuery } = uiSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeSlice.reducer,
    ui: uiSlice.reducer
  }
})
