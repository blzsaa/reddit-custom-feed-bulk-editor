import { DatatableRow } from "@/types";
import { MultisService } from "./MultisService";

export async function mustBeAnExistingSubreddit(
  value: string,
  multisService: MultisService
) {
  if (!value) {
    return true;
  }
  const lowerCase = value.toLowerCase();

  const subredditNames = await multisService.searchSubreddit(lowerCase);
  return subredditNames.some(
    (subredditName) => subredditName.toLowerCase() === lowerCase
  );
}

export function mustBeNotAlreadyInDataTable(
  value: string,
  dataTableContent: DatatableRow[]
) {
  if (!value) {
    return true;
  }
  const lowerCase = value.toLowerCase();
  return !dataTableContent.some((row) => row.name.toLowerCase() === lowerCase);
}
