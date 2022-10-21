import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user/userSlice';
import categoriesSlice from './categories/categoriesSlice';
import  groupLogicSlice from './group/group';

export default configureStore({
  reducer: {
    user: userSlice,
    categories: categoriesSlice,
    groupInfo: groupLogicSlice,
  }
});
