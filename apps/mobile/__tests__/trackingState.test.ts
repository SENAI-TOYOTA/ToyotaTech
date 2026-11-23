import { ApiError } from "@/services/api";
import {
  formatUpdatedAt,
  hasTrackingData,
  resolveTrackingError,
} from "@/services/tracking";
import { TrackingInfo } from "@/types/tracking";
import { describe, expect, it } from "@jest/globals";

describe("resolveTrackingError", () => {
  it("trata veiculo nao vinculado sem oferecer nova tentativa", () => {
    const state = resolveTrackingError(
      new ApiError("Veículo não vinculado.", 404)
    );

    expect(state.kind).toBe("unlinked");
    expect(state.retryable).toBe(false);
  });

  it("trata sessao expirada sem oferecer nova tentativa", () => {
    const state = resolveTrackingError(new ApiError("Não autorizado.", 401));

    expect(state.kind).toBe("expired");
    expect(state.retryable).toBe(false);
  });

  it("informa o tempo de espera em 429", () => {
    const state = resolveTrackingError(
      new ApiError("Limite excedido.", 429, 30)
    );

    expect(state.kind).toBe("throttled");
    expect(state.retryable).toBe(true);
    expect(state.description).toContain("30s");
  });

  it("trata falha de servidor como recuperavel", () => {
    const state = resolveTrackingError(new ApiError("Erro interno.", 500));

    expect(state.kind).toBe("server");
    expect(state.retryable).toBe(true);
  });

  it("trata falha de conexao como recuperavel", () => {
    const state = resolveTrackingError(new Error("offline"));

    expect(state.kind).toBe("unknown");
    expect(state.title).toBe("Falha de conexão");
    expect(state.retryable).toBe(true);
  });
});

describe("formatUpdatedAt", () => {
  const base = Date.UTC(2026, 10, 11, 12, 0, 0);

  it("retorna vazio sem horario", () => {
    expect(formatUpdatedAt(null, base)).toBe("");
  });

  it("mostra atualizado agora no mesmo minuto", () => {
    expect(formatUpdatedAt(base - 20000, base)).toBe("Atualizado agora");
  });

  it("mostra minutos", () => {
    expect(formatUpdatedAt(base - 5 * 60000, base)).toBe("Atualizado há 5 min");
  });

  it("mostra horas a partir de 60 minutos", () => {
    expect(formatUpdatedAt(base - 90 * 60000, base)).toBe("Atualizado há 1 h");
  });
});

describe("hasTrackingData", () => {
  it("rejeita payload ausente", () => {
    expect(hasTrackingData(null)).toBe(false);
  });

  it("rejeita payload vazio", () => {
    expect(hasTrackingData({} as TrackingInfo)).toBe(false);
  });

  it("aceita veiculo identificado", () => {
    expect(hasTrackingData({ vehicleId: "1" } as TrackingInfo)).toBe(true);
  });

  it("aceita timeline com etapas", () => {
    expect(
      hasTrackingData({
        steps: [{ id: "s1", label: "Montagem", status: "completed" }],
      } as TrackingInfo)
    ).toBe(true);
  });
});
