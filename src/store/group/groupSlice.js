import { createSlice } from '@reduxjs/toolkit';

export const groupLogicSlice = createSlice({
  name: 'user',
  initialState: {
    groupId: null,
    isAdmin: false,
  },
  reducers: {
    setGroupId: (state, action) => {
      const { groupId } = action.payload;
      state.groupId = groupId;
    },
    setIsAdmin: (state, action) => {
      const { isAdmin } = action.payload;
      state.isAdmin = isAdmin;
    },
    removeGroupId: (state, action) => {
      state.groupId = null;
    },
  }
});

// Action creators are generated for each case reducer function
export const { setGroupId, setIsAdmin, removeGroupId } = groupLogicSlice.actions;
export default groupLogicSlice.reducer;
