import { createSlice } from '@reduxjs/toolkit';

export const citiesSlice = createSlice({
  name: 'cities',
  initialState: {
    value: []
  },
  reducers: {
    setCities: (state, action) => {
      state.value = action.payload;
    },
    removeCities: (state) => {
      state.value = [];
    }
  }
});

// Action creators are generated for each case reducer function
export const { removeCities, setCities } = citiesSlice.actions;
export default citiesSlice.reducer;
