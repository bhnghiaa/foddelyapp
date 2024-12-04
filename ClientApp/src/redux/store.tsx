import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import locationReducer from "./locationSlice";
export const store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
        order: orderReducer,
        location: locationReducer
    },
});

// Types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
