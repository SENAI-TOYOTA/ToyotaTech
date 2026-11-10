import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SubscriptionOptions } from "@reduxjs/toolkit/query";

import { api } from "@/store/api";
import type {
  ProducaoStatus,
  ProducaoStatusEnvelope,
} from "@/types/tracking";

/**
 * Intervalo padrão de polling para telemetria IIoT da linha de produção (5 segundos).
 */
export const PRODUCTION_POLLING_INTERVAL_MS = 5000;

export interface ProductionTrackingState {
  tracking: ProducaoStatus | null;
  activeVin: string | null;
  pollingInterval: number;
  lastPolledAt: number | null;
}

const initialState: ProductionTrackingState = {
  tracking: null,
  activeVin: null,
  pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
  lastPolledAt: null,
};

function unwrapProducaoPayload(
  response: ProducaoStatus | ProducaoStatusEnvelope,
): ProducaoStatus {
  if ("tracking" in response && response.tracking) {
    return response.tracking;
  }
  if ("producao" in response && response.producao) {
    return response.producao;
  }
  return response as ProducaoStatus;
}

export const productionTrackingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Busca o status de fabricação do chassi/VIN na API .NET (`GET /api/producao/{vin}`).
     */
    getProducao: builder.query<ProducaoStatus, string>({
      query: (vin) => ({
        url: `/api/producao/${encodeURIComponent(vin)}`,
        method: "GET",
      }),
      transformResponse: (
        response: ProducaoStatus | ProducaoStatusEnvelope,
      ) => unwrapProducaoPayload(response),
      providesTags: (_result, _error, vin) => [
        { type: "ProductionTracking", id: vin },
        "ProductionTracking",
      ],
    }),

    /**
     * Consome a rota REST `/garage/status` (compatível com o simulador Python/MQTT).
     */
    getGarageStatus: builder.query<ProducaoStatus, void>({
      query: () => ({
        url: "/garage/status",
        method: "GET",
      }),
      transformResponse: (
        response: ProducaoStatus | ProducaoStatusEnvelope,
      ) => unwrapProducaoPayload(response),
      providesTags: ["ProductionTracking"],
    }),
  }),
  overrideExisting: false,
});

export interface ProductionPollingOptions extends SubscriptionOptions {
  skip?: boolean;
  refetchOnMountOrArgChange?: boolean | number;
}

/**
 * Hook de acompanhamento em tempo real do chassi (`GET /api/producao/{vin}`).
 * Configurado por padrão com `pollingInterval: 5000` (5 segundos) para refletir
 * continuamente os eventos MQTT industriais processados pelo backend.
 */
export function useGetProducaoQuery(
  vin: string,
  options?: ProductionPollingOptions,
) {
  return productionTrackingApi.useGetProducaoQuery(vin, {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
    skipPollingIfUnfocused: true,
    ...options,
  });
}

/**
 * Hook de status da esteira via `/garage/status` com polling contínuo de 5 segundos.
 */
export function useGetGarageStatusQuery(
  arg?: void,
  options?: ProductionPollingOptions,
) {
  return productionTrackingApi.useGetGarageStatusQuery(arg, {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
    skipPollingIfUnfocused: true,
    ...options,
  });
}

/**
 * Hook de status da esteira com polling contínuo de 5 segundos (`pollingInterval: 5000`).
 * Aceita um `vin` opcional (consulta `/api/producao/{vin}`) ou sem argumento (`/api/producao/9BRB29BE0T0048210`).
 */
export function useGetProducaoStatusQuery(
  vin: string = "9BRB29BE0T0048210",
  options?: ProductionPollingOptions,
) {
  return productionTrackingApi.useGetProducaoQuery(vin, {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
    skipPollingIfUnfocused: true,
    ...options,
  });
}

export const {
  useLazyGetProducaoQuery,
  useLazyGetGarageStatusQuery,
} = productionTrackingApi;

export const productionTrackingSlice = createSlice({
  name: "productionTracking",
  initialState,
  reducers: {
    setActiveVin: (state, action: PayloadAction<string | null>) => {
      state.activeVin = action.payload;
    },
    setTrackingStatus: (
      state,
      action: PayloadAction<ProducaoStatus | null>,
    ) => {
      state.tracking = action.payload;
      state.lastPolledAt = action.payload ? Date.now() : null;
    },
    setPollingInterval: (state, action: PayloadAction<number>) => {
      state.pollingInterval = Math.max(action.payload, 1000);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        productionTrackingApi.endpoints.getProducao.matchFulfilled,
        (state, { payload, meta }) => {
          state.tracking = payload;
          state.activeVin = meta.arg.originalArgs;
          state.lastPolledAt = Date.now();
        },
      )
      .addMatcher(
        productionTrackingApi.endpoints.getGarageStatus.matchFulfilled,
        (state, { payload }) => {
          state.tracking = payload;
          state.activeVin =
            payload.vin ?? payload.chassi ?? payload.vehicleId ?? state.activeVin;
          state.lastPolledAt = Date.now();
        },
      );
  },
});

export const { setActiveVin, setTrackingStatus, setPollingInterval } =
  productionTrackingSlice.actions;

export default productionTrackingSlice.reducer;

