import { createSlice } from '@reduxjs/toolkit';

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    value: []
  },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
    remove: (state) => {
      state.value = [];
    }
  }
});

// Action creators are generated for each case reducer function
export const { remove, set } = categoriesSlice.actions;
export default categoriesSlice.reducer;
