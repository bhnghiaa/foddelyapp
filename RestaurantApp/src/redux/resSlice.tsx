import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'lodash';


interface ResState {
    resId: string;
    profile: string;
}

const initialState: ResState = {
    resId: '',
    profile: ''
};


const resSlice = createSlice({
    name: 'res',
    initialState,
    reducers: {
        setResId: (state, action: PayloadAction<string>) => {
            state.resId = action.payload;
        },
        setProfile: (state, action: PayloadAction<string>) => {
            state.profile = action.payload
        }
    },
});

export const { setResId, setProfile } = resSlice.actions;
export default resSlice.reducer;
