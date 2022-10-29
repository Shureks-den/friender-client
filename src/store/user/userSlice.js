import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: {},
    activeEvents: []
  },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
    remove: (state) => {
      state.value = null;
    },
    setActiveEvents: (state, action) => {
      state.activeEvents = action.payload;
    },
    addActiveEvent: (state, action) => {
      const activeEvents = state.activeEvents;
      activeEvents.push(action.payload);
      state.activeEvents = activeEvents;
    },
    removeActiveEvents: (state) => {
      state.activeEvents = [];
    }
  }
});

// Action creators are generated for each case reducer function
export const { remove, set, setActiveEvents, removeActiveEvents, addActiveEvent} = userSlice.actions;
export default userSlice.reducer;
