import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API } from "../../../Core/url";

const initialState = {
  profile: {},
  loading: false,
  error: null,
};

export const userProfile = createAsyncThunk(
  "profile/fetch",
  async (token, { rejectWithValue }) => {
    try {
      console.log("token", token);

      const response = await API.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response", response);

      return response.data;
    } catch (error) {
      console.log("error", error);

      if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = {};
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(userProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
