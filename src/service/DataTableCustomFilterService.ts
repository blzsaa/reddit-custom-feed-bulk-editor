import type { MultiReddit } from "@/types";
import { FilterMatchMode } from "primevue/api";
import type { DataTableFilterMeta } from "primevue/datatable";

export const generateFiltersForDataTable: (
  multis: MultiReddit[],
) => DataTableFilterMeta = (multis: MultiReddit[]) => {
  return multis
    .map((m) => m.display_name)
    .reduce(
      (filterObject, a) => {
        filterObject[a] = {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        };
        return filterObject;
      },
      {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        subscribed: {
          value: null,
          matchMode: FilterMatchMode.EQUALS,
        },
      } as DataTableFilterMeta,
    );
};
