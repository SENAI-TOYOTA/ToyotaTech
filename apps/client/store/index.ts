import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import { api } from "@/store/api";
import authReducer from "@/store/slices/authSlice";
import garageReducer from "@/store/slices/garageSlice";
import productionTrackingReducer from "@/store/slices/productionTrackingSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      garage: garageReducer,
      productionTracking: productionTrackingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
}

export const store = makeStore();

setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export {
  authApi,
  hydrateAuth,
  logout,
  setCredentials,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
} from "@/store/slices/authSlice";
export {
  clearGarageData,
  garageApi,
  setGarageData,
  useGetGarageCurrentQuery,
  useGetGarageQuery,
  useGetVeiculoQuery,
  useLazyGetGarageCurrentQuery,
  useLazyGetGarageQuery,
  useLazyGetVeiculoQuery,
  useLinkGaragePurchaseMutation,
} from "@/store/slices/garageSlice";
export {
  PRODUCTION_POLLING_INTERVAL_MS,
  productionTrackingApi,
  setActiveVin,
  setPollingInterval,
  setTrackingStatus,
  useGetGarageStatusQuery,
  useGetProducaoQuery,
  useGetProducaoStatusQuery,
  useLazyGetGarageStatusQuery,
  useLazyGetProducaoQuery,
} from "@/store/slices/productionTrackingSlice";

