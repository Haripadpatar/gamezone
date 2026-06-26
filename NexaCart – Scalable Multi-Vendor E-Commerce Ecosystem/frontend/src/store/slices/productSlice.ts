import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ProductFilters {
  keyword: string;
  categorySlug: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  size: string | null;
  color: string | null;
  page: number;
  sortBy: string;
  sortDir: string;
}

const initialState: ProductFilters = {
  keyword: '',
  categorySlug: null,
  minPrice: null,
  maxPrice: null,
  size: null,
  color: null,
  page: 0,
  sortBy: 'id',
  sortDir: 'asc',
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilterKeyword: (state, action: PayloadAction<string>) => {
      state.keyword = action.payload;
      state.page = 0; // Reset page on filter change
    },
    setFilterCategory: (state, action: PayloadAction<string | null>) => {
      state.categorySlug = action.payload;
      state.page = 0;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortDir: string }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      return { ...state, ...action.payload, page: 0 };
    },
    resetFilters: () => {
      return initialState;
    },
  },
});

export const { setFilterKeyword, setFilterCategory, setPage, setSorting, updateFilters, resetFilters } = productSlice.actions;
export default productSlice.reducer;
