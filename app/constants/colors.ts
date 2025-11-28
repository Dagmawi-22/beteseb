// Chat App Theme Colors
// Customize your primary color here

export const AppColors = {
  // Primary color - change this to customize your app theme
  primary: '#000',

  // Supporting colors
  background: '#fff',
  text: '#000',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#ddd',
  borderLight: '#eee',
  inputBackground: '#f9f9f9',
  disabledBackground: '#f0f0f0',
  messageBubbleOther: '#E9E9EB',
  white: '#fff',
  disabled: '#ccc',
  success: '#4CAF50',

  // Dynamic colors based on primary
  get primaryLight() {
    return this.primary + '10'; // 10% opacity
  },
  get primaryDark() {
    return this.primary;
  },
};
