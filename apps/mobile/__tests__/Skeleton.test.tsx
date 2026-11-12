import Skeleton from "@/components/ui/Skeleton";
import { colors, radii } from "@/theme";
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

describe("Skeleton", () => {
  it("renderiza o bloco com as dimensoes informadas", async () => {
    const { getByRole } = await render(
      <Skeleton
        accessibilityLabel="Carregando"
        height={160}
        width={180}
        borderRadius={4}
      />
    );

    const style = StyleSheet.flatten(getByRole("progressbar").props.style);

    expect(style.height).toBe(160);
    expect(style.width).toBe(180);
    expect(style.borderRadius).toBe(4);
    expect(style.backgroundColor).toBe(colors.grayLight);
  });

  it("usa largura total e raio padrao quando nao informados", async () => {
    const { getByRole } = await render(
      <Skeleton accessibilityLabel="Carregando" height={50} />
    );

    const style = StyleSheet.flatten(getByRole("progressbar").props.style);

    expect(style.width).toBe("100%");
    expect(style.borderRadius).toBe(radii.sm);
  });

  it("fica oculto do leitor de tela sem rotulo de acessibilidade", async () => {
    const { queryByRole, toJSON } = await render(<Skeleton height={50} />);
    const element = toJSON();

    expect(queryByRole("progressbar")).toBeNull();
    expect(element?.props.accessibilityElementsHidden).toBe(true);
    expect(element?.props.importantForAccessibility).toBe(
      "no-hide-descendants"
    );
  });

  it("desmonta sem deixar a animacao em execucao", async () => {
    const { unmount } = await render(<Skeleton height={50} />);

    await expect(unmount()).resolves.toBeUndefined();
  });
});
