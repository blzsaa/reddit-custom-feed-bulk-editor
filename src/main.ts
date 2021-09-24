import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import Tooltip from "primevue/tooltip";
import { createPinia } from "pinia";

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue)
  .directive("tooltip", Tooltip)
  .mount("#app");
