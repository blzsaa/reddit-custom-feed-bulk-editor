import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { createPinia } from "pinia";
import "primeflex/primeflex.css";

import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Chip from "primevue/chip";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import Panel from "primevue/panel";
import ProgressSpinner from "primevue/progressspinner";
import Skeleton from "primevue/skeleton";
import Toast from "primevue/toast";
import TriStateCheckbox from "primevue/tristatecheckbox";
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue)
  .use(ToastService)
  .directive("tooltip", Tooltip)
  .component("AutoComplete", AutoComplete)
  .component("Button", Button)
  .component("Checkbox", Checkbox)
  .component("Chip", Chip)
  .component("Column", Column)
  .component("DataTable", DataTable)
  .component("Dialog", Dialog)
  .component("Divider", Divider)
  .component("InputText", InputText)
  .component("OverlayPanel", OverlayPanel)
  .component("Panel", Panel)
  .component("ProgressSpinner", ProgressSpinner)
  .component("Skeleton", Skeleton)
  .component("Toast", Toast)
  .component("TriStateCheckbox", TriStateCheckbox)
  .mount("#app");
