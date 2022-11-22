import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user/userSlice';
import categoriesSlice from './categories/categoriesSlice';
import groupLogicSlice from './group/groupSlice';
import citiesSlice from './cities/citiesSlice';
import searchSlice from './search/searchSlice';

export default configureStore({
  reducer: {
    user: userSlice,
    categories: categoriesSlice,
    cities: citiesSlice,
    groupInfo: groupLogicSlice,
    search: searchSlice,
  }
});
