export class Subreddit {
  constructor(public display_name: string, public description_html: string) {}
}

export class MultiReddit {
  constructor(
    public display_name: string,
    public path: string,
    public subreddits: Set<string>
  ) {}
}

export interface DataTableFilter {
  name: { value: null; matchMode: string | undefined };
  [key: string]: { value: null; matchMode: string | undefined };
}

export enum Action {
  Subscribe = "Subscribe",
  Unsubscribe = "Unsubscribe",
}

export type DatatableRow = {
  name: string;
  subscribed: boolean;
  [key: string]: boolean | string;
};

export type NullableUndefinableBoolean = boolean | null | undefined;
