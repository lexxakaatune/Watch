import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../../api/notification';

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationAPI.getNotifications();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notification/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationAPI.markRead(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to mark as read');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.notifications || [];
        state.unreadCount = state.items.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find(n => n._id === action.payload);
        if (item) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationSlice.reducer;
