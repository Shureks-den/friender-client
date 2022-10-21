import { createSlice } from '@reduxjs/toolkit';

export const groupLogicSlice = createSlice({
  name: 'user',
  initialState: {
    groupId: null,
    isAdmin: false,
  },
  reducers: {
    setGroupId: (state, action) => {
      state.groupId = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
    removeGroupId: (state, action) => {
      state.groupId = null;
    },
  }
});

// Action creators are generated for each case reducer function
export const { setGroupId, setIsAdmin, removeGroupId } = groupLogicSlice.actions;
export default groupLogicSlice.reducer;
