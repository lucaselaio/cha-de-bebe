import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";

const sohoSurface = {
  0: "#ffffff",
  50: "#f4f4f4",
  100: "#e8e9e9",
  200: "#d2d2d4",
  300: "#bbbcbe",
  400: "#a5a5a9",
  500: "#8e8f93",
  600: "#77787d",
  700: "#616267",
  800: "#4a4b51",
  900: "#34353c",
  950: "#1d1e26",
};

const pastelPrimary = {
  50: "#fcf7f4",
  100: "#f8eee8",
  200: "#f0ddd2",
  300: "#e5c7b7",
  400: "#d7ad97",
  500: "#c79279",
  600: "#ae7965",
  700: "#8f6255",
  800: "#734f47",
  900: "#5f433e",
  950: "#332321",
};

export default definePreset(Lara, {
  semantic: {
    primary: pastelPrimary,
    colorScheme: {
      light: {
        surface: sohoSurface,
      },
    },
  },
});
