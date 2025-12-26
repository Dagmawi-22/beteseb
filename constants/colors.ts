export const AppColors = {
  primary: "#000",

  background: "#fff",
  text: "#000",
  textSecondary: "#666",
  textTertiary: "#999",
  border: "#ddd",
  borderLight: "#eee",
  inputBackground: "#f9f9f9",
  disabledBackground: "#f0f0f0",
  messageBubbleOther: "#E9E9EB",
  white: "#fff",
  disabled: "#ccc",
  success: "#4CAF50",

  get primaryLight() {
    return this.primary + "10";
  },
  get primaryDark() {
    return this.primary;
  },
};
