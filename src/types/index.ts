export class Subreddit {
  constructor(public display_name: string, public description_html: string) {}
}

export class MultiReddit {
  constructor(public display_name: string, public subreddits: string[]) {}
}

export interface DataTableFilter {
  name: { value: null; matchMode: string | undefined };
  [key: string]: { value: null; matchMode: string | undefined };
}

export enum Action {
  Subscribe = "Subscribe",
  Unsubscribe = "Unsubscribe",
}
