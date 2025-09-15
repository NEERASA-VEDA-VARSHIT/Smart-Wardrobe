import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import notificationsReducer from './notificationsSlice';
import wardrobeReducer from './wardrobeSlice';
import clothesReducer from './clothesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    wardrobe: wardrobeReducer,
    clothes: clothesReducer,
  },
});


