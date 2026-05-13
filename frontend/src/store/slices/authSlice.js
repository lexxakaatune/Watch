import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/auth';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const verify2FA = createAsyncThunk('auth/verify2FA', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.verify2FA(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || '2FA verification failed');
  }
});

export const setup2FA = createAsyncThunk('auth/setup2FA', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.setup2FA();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || '2FA setup failed');
  }
});

export const confirm2FA = createAsyncThunk('auth/confirm2FA', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.confirm2FA(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || '2FA confirmation failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.me();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch user');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Logout failed');
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  requires2FA: false,
  pending2FAEmail: null,
  twoFASecret: null,
  twoFAQR: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clear2FA: (state) => {
      state.requires2FA = false;
      state.pending2FAEmail = null;
      state.twoFASecret = null;
      state.twoFAQR = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data.requires2FA) {
          state.requires2FA = true;
          state.pending2FAEmail = action.payload.data.user.email;
        } else {
          state.user = action.payload.data.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verify2FA.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.requires2FA = false;
        state.pending2FAEmail = null;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setup2FA.fulfilled, (state, action) => {
        state.twoFASecret = action.payload.data.secret;
        state.twoFAQR = action.payload.data.qrCode;
      })
      .addCase(confirm2FA.fulfilled, (state) => {
        if (state.user) state.user.twoFactorEnabled = true;
        state.twoFASecret = null;
        state.twoFAQR = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.requires2FA = false;
        state.pending2FAEmail = null;
      });
  },
});

export const { clearError, clear2FA } = authSlice.actions;
export default authSlice.reducer;
