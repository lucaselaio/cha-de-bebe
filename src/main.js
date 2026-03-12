import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import App from "./App.vue";
import router from "./router";
import BabyPreset from "./theme/preset";
import "./styles/main.css";

const app = createApp(App);

app.use(router);
app.use(ToastService);
app.use(PrimeVue, {
  ripple: true,
  inputVariant: "filled",
  theme: {
    preset: BabyPreset,
    options: {
      darkModeSelector: false,
    },
  },
});

app.mount("#app");
