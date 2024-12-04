import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coordinates } from '../@types';

interface LocationState {
    latitude: number;
    longitude: number;
    address?: string;
    distance?: number;
}
const initialState: LocationState = {
    latitude: 0,
    longitude: 0,
    address: '',
    distance: 0,
};


const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action: PayloadAction<Coordinates>) => {
            state.latitude = action.payload.latitude;
            state.longitude = action.payload.longitude;
        },
        setAddress: (state, action: PayloadAction<string>) => {
            state.address = action.payload;
        },
        setDistance: (state, action: PayloadAction<number>) => {
            state.distance = action.payload;
        }
    },
});

export const { setLocation, setAddress, setDistance } = locationSlice.actions;
export default locationSlice.reducer;
