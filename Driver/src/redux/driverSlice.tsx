import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DriverState {
    isAvailable: boolean;
}

const initialState: DriverState = {
    isAvailable: true
};


const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {
        setAvailability: (state, action: PayloadAction<boolean>) => {
            state.isAvailable = action.payload;
        }
    },
});

export const { setAvailability } = driverSlice.actions;
export default driverSlice.reducer;
