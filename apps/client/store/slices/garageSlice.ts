import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { api } from "@/store/api";
import type { GarageResponse, VeiculoData } from "@/types/garage";

export interface GarageState {
  garage: VeiculoData | null;
  lastSyncedAt: number | null;
}

const initialState: GarageState = {
  garage: null,
  lastSyncedAt: null,
};

function unwrapGaragePayload(
  response: VeiculoData | GarageResponse,
): VeiculoData {
  if ("garage" in response && response.garage) {
    return response.garage;
  }
  return response as VeiculoData;
}

export const garageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGarage: builder.query<VeiculoData, void>({
      query: () => ({
        url: "/api/garagem",
        method: "GET",
      }),
      transformResponse: (response: VeiculoData | GarageResponse) =>
        unwrapGaragePayload(response),
      providesTags: ["Garage"],
    }),
    getGarageCurrent: builder.query<VeiculoData, void>({
      query: () => ({
        url: "/garage/current",
        method: "GET",
      }),
      transformResponse: (response: VeiculoData | GarageResponse) =>
        unwrapGaragePayload(response),
      providesTags: ["Garage"],
    }),
    linkGaragePurchase: builder.mutation<
      VeiculoData,
      { purchaseId?: string; orderId?: string }
    >({
      query: (body) => ({
        url: "/garage/link",
        method: "POST",
        body,
      }),
      transformResponse: (response: VeiculoData | GarageResponse) =>
        unwrapGaragePayload(response),
      invalidatesTags: ["Garage", "ProductionTracking"],
    }),
  }),
  overrideExisting: false,
});

export const garageSlice = createSlice({
  name: "garage",
  initialState,
  reducers: {
    setGarageData: (state, action: PayloadAction<VeiculoData | null>) => {
      state.garage = action.payload;
      state.lastSyncedAt = action.payload ? Date.now() : null;
    },
    clearGarageData: (state) => {
      state.garage = null;
      state.lastSyncedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        garageApi.endpoints.getGarage.matchFulfilled,
        (state, { payload }) => {
          state.garage = payload;
          state.lastSyncedAt = Date.now();
        },
      )
      .addMatcher(
        garageApi.endpoints.getGarageCurrent.matchFulfilled,
        (state, { payload }) => {
          state.garage = payload;
          state.lastSyncedAt = Date.now();
        },
      )
      .addMatcher(
        garageApi.endpoints.linkGaragePurchase.matchFulfilled,
        (state, { payload }) => {
          state.garage = payload;
          state.lastSyncedAt = Date.now();
        },
      );
  },
});

export const { setGarageData, clearGarageData } = garageSlice.actions;

export const {
  useGetGarageQuery,
  useLazyGetGarageQuery,
  useGetGarageCurrentQuery,
  useLazyGetGarageCurrentQuery,
  useLinkGaragePurchaseMutation,
} = garageApi;

/** Alias semântico para busca dos dados do veículo, documentos e financiamento. */
export const useGetVeiculoQuery = useGetGarageQuery;
export const useLazyGetVeiculoQuery = useLazyGetGarageQuery;

export default garageSlice.reducer;

