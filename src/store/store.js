import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user/userSlice';
import categoriesSlice from './categories/categoriesSlice';

export default configureStore({
  reducer: {
    user: userSlice,
    categories: categoriesSlice,
  }
});
