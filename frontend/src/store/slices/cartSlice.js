import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

export const fetchCart    = createAsyncThunk('cart/fetch',    async (_, { rejectWithValue }) => {
  try { const { data } = await cartAPI.getCart(); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch cart'); }
});
export const addToCart    = createAsyncThunk('cart/add',      async (item, { rejectWithValue }) => {
  try { const { data } = await cartAPI.addItem(item); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to add item'); }
});
export const updateQty    = createAsyncThunk('cart/updateQty', async ({ productId, quantity }, { rejectWithValue }) => {
  try { const { data } = await cartAPI.updateQuantity(productId, quantity); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try { const { data } = await cartAPI.removeItem(productId); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const clearCart    = createAsyncThunk('cart/clear',    async (_, { rejectWithValue }) => {
  try { await cartAPI.clearCart(); return { userId: '', items: [] }; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null, isOpen: false },
  reducers: {
    toggleCart(state)       { state.isOpen = !state.isOpen; },
    openCart(state)         { state.isOpen = true; },
    closeCart(state)        { state.isOpen = false; },
    clearCartLocal(state)   { state.items = []; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    };
    builder
      .addCase(fetchCart.pending,      (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled,    setCart)
      .addCase(fetchCart.rejected,     (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addToCart.fulfilled,    setCart)
      .addCase(updateQty.fulfilled,    setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled,    setCart);
  },
});

export const { toggleCart, openCart, closeCart, clearCartLocal } = cartSlice.actions;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export default cartSlice.reducer;
