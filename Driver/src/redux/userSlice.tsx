import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    username: string;
    token: string;
    profile: string;
    email: string;
    userId: string;
}

const initialState: UserState = {
    username: '',
    token: '',
    profile: '',
    email: '',
    userId: '',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserState>) => {
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.profile = action.payload.profile;
            state.email = action.payload.email;
            state.userId = action.payload.userId;
        },
        logout: (state) => {
            state.username = '';
            state.token = '';
        },
    },
});

export const { setUserData, logout } = userSlice.actions;
export default userSlice.reducer;
