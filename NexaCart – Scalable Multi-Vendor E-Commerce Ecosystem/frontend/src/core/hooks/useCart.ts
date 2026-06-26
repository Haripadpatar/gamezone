import { useAppDispatch, useAppSelector } from '../../store';
import { cartStart, cartSuccess, cartFailure, clearCart } from '../../store/slices/cartSlice';
import axiosClient from '../api/axiosClient';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    dispatch(cartStart());
    try {
      const response = await axiosClient.get('/api/v1/cart');
      if (response.data.success) {
        dispatch(cartSuccess(response.data.data));
      }
    } catch (err: any) {
      dispatch(cartFailure(err.response?.data?.message || 'Failed to fetch cart'));
    }
  };

  const addItemToCart = async (variantId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to your cart.');
    }
    dispatch(cartStart());
    try {
      const response = await axiosClient.post('/api/v1/cart', {
        productVariantId: variantId,
        quantity,
      });
      if (response.data.success) {
        dispatch(cartSuccess(response.data.data));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to add item to cart';
      dispatch(cartFailure(errMsg));
      throw new Error(errMsg);
    }
  };

  const updateItemQuantity = async (variantId: number, quantity: number) => {
    if (!isAuthenticated) return;
    dispatch(cartStart());
    try {
      const response = await axiosClient.put(`/api/v1/cart/items/${variantId}?quantity=${quantity}`);
      if (response.data.success) {
        dispatch(cartSuccess(response.data.data));
      }
    } catch (err: any) {
      dispatch(cartFailure(err.response?.data?.message || 'Failed to update quantity'));
    }
  };

  const removeItemFromCart = async (variantId: number) => {
    if (!isAuthenticated) return;
    dispatch(cartStart());
    try {
      const response = await axiosClient.delete(`/api/v1/cart/items/${variantId}`);
      if (response.data.success) {
        dispatch(cartSuccess(response.data.data));
      }
    } catch (err: any) {
      dispatch(cartFailure(err.response?.data?.message || 'Failed to remove item'));
    }
  };

  return {
    ...cartState,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart: () => dispatch(clearCart()),
  };
};
