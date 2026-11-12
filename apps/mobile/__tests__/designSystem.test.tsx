import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import { fontSize, radii, spacing } from "@/theme";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

describe("Card", () => {
  it("renderiza o conteudo com borda e raio do tema", async () => {
    const { getByText, toJSON } = await render(
      <Card>
        <Text>Conteudo</Text>
      </Card>
    );

    const style = StyleSheet.flatten(toJSON()?.props.style);

    expect(getByText("Conteudo")).toBeTruthy();
    expect(style.borderRadius).toBe(radii.sm);
    expect(style.padding).toBe(spacing.md);
  });
});

describe("Badge", () => {
  it("renderiza o rotulo em formato de pilula", async () => {
    const { getByText, toJSON } = await render(<Badge label="Disponível" />);

    const style = StyleSheet.flatten(toJSON()?.props.style);

    expect(getByText("Disponível")).toBeTruthy();
    expect(style.borderRadius).toBe(radii.sm);
  });
});

describe("TextField", () => {
  it("renderiza rotulo e repassa a digitacao", async () => {
    const onChangeText = jest.fn();
    const { getByText, getByPlaceholderText } = await render(
      <TextField
        label="CPF"
        placeholder="000.000.000-00"
        value=""
        onChangeText={onChangeText}
      />
    );

    fireEvent.changeText(getByPlaceholderText("000.000.000-00"), "123");

    expect(getByText("CPF")).toBeTruthy();
    expect(onChangeText).toHaveBeenCalledWith("123");
  });

  it("exibe a mensagem de erro apenas quando informada", async () => {
    const { getByText, queryByText, rerender } = await render(
      <TextField label="CPF" error="CPF inválido" />
    );

    expect(getByText("CPF inválido")).toBeTruthy();

    await rerender(<TextField label="CPF" error={null} />);

    expect(queryByText("CPF inválido")).toBeNull();
  });

  it("usa o estilo padrao do campo de entrada", async () => {
    const { getByPlaceholderText } = await render(
      <TextField label="Nome" placeholder="Nome completo" />
    );

    const style = StyleSheet.flatten(
      getByPlaceholderText("Nome completo").props.style
    );

    expect(style.fontSize).toBe(fontSize.sm);
  });
});

describe("Screen", () => {
  it("renderiza o conteudo com scroll por padrao", async () => {
    const { getByText } = await render(
      <Screen>
        <Text>Pagina</Text>
      </Screen>
    );

    expect(getByText("Pagina")).toBeTruthy();
  });

  it("renderiza o conteudo sem scroll quando desativado", async () => {
    const { getByText } = await render(
      <Screen scroll={false}>
        <Text>Fixa</Text>
      </Screen>
    );

    expect(getByText("Fixa")).toBeTruthy();
  });
});
