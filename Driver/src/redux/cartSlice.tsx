// store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    additives?: any[];
    userId: string;
    note?: string;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: []
};


const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addProductToCart: (state, action: PayloadAction<CartItem>) => {
            const { id, productId, quantity, totalPrice, additives, userId, note } = action.payload;
            state.items.push({ id, productId, quantity, totalPrice, additives, userId, note });

        },
        removeProductFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.productId !== action.payload);
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addProductToCart, removeProductFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
