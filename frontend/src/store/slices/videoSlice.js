import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { videoAPI } from '../../api/video';

export const fetchFeed = createAsyncThunk('video/fetchFeed', async (params, { rejectWithValue }) => {
  try {
    const res = await videoAPI.getFeed(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load feed');
  }
});

export const fetchTrending = createAsyncThunk('video/fetchTrending', async (_, { rejectWithValue }) => {
  try {
    const res = await videoAPI.getTrending();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load trending');
  }
});

export const fetchVideo = createAsyncThunk('video/fetchVideo', async (id, { rejectWithValue }) => {
  try {
    const res = await videoAPI.getVideo(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load video');
  }
});

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    feed: [],
    trending: [],
    currentVideo: null,
    recommendations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload.data?.videos || [];
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload.data?.videos || [];
      })
      .addCase(fetchVideo.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload.data?.video || null;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentVideo } = videoSlice.actions;
export default videoSlice.reducer;
