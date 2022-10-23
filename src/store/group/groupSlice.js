import { createSlice } from '@reduxjs/toolkit';

export const groupLogicSlice = createSlice({
  name: 'user',
  initialState: {
    groupId: null,
    isAdmin: false,
    adminedGroups: [],
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
    setAdminedGroups: (state, action) => {
      const { adminedGroups } = action.payload;
      state.adminedGroups = adminedGroups;
    },
    addAdminedGroup: (state, action) => {
      const { adminedGroup } = action.payload;
      state.adminedGroups = state.adminedGroups.push(adminedGroup);
    }
  }
});

// Action creators are generated for each case reducer function
export const { setGroupId, setIsAdmin, removeGroupId, setAdminedGroups, addAdminedGroup } = groupLogicSlice.actions;
export default groupLogicSlice.reducer;
