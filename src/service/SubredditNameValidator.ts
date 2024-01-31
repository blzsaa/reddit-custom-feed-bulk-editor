import type { DatatableRow } from "@/types";
import { MultisService } from "./MultisService";

async function isSubredditExist(value: string, multisService: MultisService) {
  const lowerCase = value.toLowerCase();

  const subredditNames = await multisService.findSubredditsByPrefix(lowerCase);
  return subredditNames.some(
    (subredditName) => subredditName.toLowerCase() === lowerCase,
  );
}

function isSubredditAlreadyAdded(
  value: string,
  dataTableContent: DatatableRow[],
) {
  const lowerCase = value.toLowerCase();
  return dataTableContent.some((row) => row.name.toLowerCase() === lowerCase);
}

export async function validateSubredditName(
  subredditName: string | undefined,
  dataTableContent: DatatableRow[],
  multisService: MultisService,
) {
  if (subredditName === undefined) {
    return "Subreddit name cannot be empty";
  }
  if (isSubredditAlreadyAdded(subredditName, dataTableContent)) {
    return "Subreddit is already added";
  }
  if (!(await isSubredditExist(subredditName, multisService))) {
    return "Subreddit with this name does not exist";
  }
  return undefined;
}
