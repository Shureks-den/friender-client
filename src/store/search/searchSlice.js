import { createSlice } from '@reduxjs/toolkit';

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    value: {
      selected: 'newEvents',
      searchWords: [],
      searchCategory: '',
      searchCity: '',
      sortValue: '',
      sortOrder: 'asc',
    },
  },
  reducers: {
    setSelected: (state, action) => {
      state.value.selected = action.payload;
    },
    setSearchWords: (state, action) => {
      state.value.searchWords = action.payload;
    },
    setSearchCategory: (state, action) => {
      state.value.searchCategory = action.payload;
    },
    setSearchCity: (state, action) => {
      state.value.searchCity = action.payload;
    },
    setSortValue: (state, action) => {
      state.value.sortValue = action.payload;
    },
    setSortOrder: (state, action) => {
      state.value.sortOrder = action.payload;
    },
    remove: (state) => {
      state.value = null;
    },
    setValue: (state, action) => {
      state.value = action.payload;
    },
  }
});

// Action creators are generated for each case reducer function
export const { setSelected, remove, setValue, setSearchWords, setSearchCategory, setSearchCity, setSortValue, setSortOrder} = searchSlice.actions;
export default searchSlice.reducer;
