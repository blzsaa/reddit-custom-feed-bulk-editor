import { DataTableFilter, MultiReddit } from "@/types";
import { FilterMatchMode } from "primevue/api";

export const generateFiltersForDataTable: (
  multis: MultiReddit[]
) => DataTableFilter = (multis: MultiReddit[]) => {
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
      } as DataTableFilter
    );
};
