export const colors = {
  primary: "#EB0A1E",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#999999",
  grayLight: "#E5E5E5",
  background: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#666666",
  border: "#CCCCCC",
};

export const fonts = {
  regular: "Afacad_400Regular",
  medium: "Afacad_500Medium",
  semiBold: "Afacad_600SemiBold",
  bold: "Afacad_700Bold",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  logo: 50,
};

export const radii = {
  button: 1,
  sm: 1,
  md: 6,
  lg: 12,
};

export const borders = {
  thin: 1,
  strong: 2,
  color: colors.black,
};

export const touch = {
  minTarget: 44,
};

export const sizes = {
  buttonRow: 40,
  inputField: 50,
};

export const elevation = {
  offset: 6,
};

export const layout = {
  screenPadding: spacing.lg + 3,
  authPadding: 55,
  sectionGap: spacing.xl + spacing.sm,
  formGap: spacing.md,
  readingWidth: 640,
};

export const semantic = {
  error: colors.primary,
  surface: colors.white,
  outline: colors.black,
  textMuted: colors.textSecondary,
};

export const textStyles = {
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badge: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
};
