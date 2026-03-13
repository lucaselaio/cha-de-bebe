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
  50: "#f4faf5",
  100: "#e8f3ea",
  200: "#d1e6d5",
  300: "#b2d4ba",
  400: "#8ebd98",
  500: "#6ea27c",
  600: "#568666",
  700: "#456c53",
  800: "#385745",
  900: "#30483a",
  950: "#19271f",
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
