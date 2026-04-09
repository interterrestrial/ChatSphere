import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Since we are mocking the backend for now, we'll start authenticated
const initialState: AuthState = {
  user: {
    _id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    avatar: 'https://i.pravatar.cc/150?u=u1',
  },
  isAuthenticated: true,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
