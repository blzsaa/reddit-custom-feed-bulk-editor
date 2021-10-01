import {
  DataTableFilter,
  MultiReddit,
  NullableUndefinableBoolean,
} from "@/types";
import { FilterMatchMode } from "primevue/api";

export const FILTER_EITHER_TRUE_OR_NULL_VALUES = "filterEitherTrueOrNullValues";

export const generateFiltersForDataTable: (
  multis: MultiReddit[]
) => DataTableFilter = (multis: MultiReddit[]) => {
  return multis
    .map((m) => m.display_name)
    .reduce(
      (filterObject, a) => {
        filterObject[a] = {
          value: null,
          matchMode: FILTER_EITHER_TRUE_OR_NULL_VALUES,
        };
        return filterObject;
      },
      {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        subscribed: {
          value: null,
          matchMode: FILTER_EITHER_TRUE_OR_NULL_VALUES,
        },
      } as DataTableFilter
    );
};

export function filterEitherTrueOrNullValues(
  valueToBeFiltered: NullableUndefinableBoolean,
  filterValue: NullableUndefinableBoolean
): boolean | null | undefined {
  if (filterValue === null || filterValue === undefined) {
    return true;
  } else if (filterValue) {
    return valueToBeFiltered;
  } else {
    return !valueToBeFiltered;
  }
}
