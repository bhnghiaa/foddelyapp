import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../@types';


interface OrderState {
    items: Order[];
}

const initialState: OrderState = {
    items: []
};


const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        addOrder: (state, action: PayloadAction<Order>) => {
            state.items.push(action.payload);
        },
    },
});

export const { addOrder } = orderSlice.actions;
export default orderSlice.reducer;
