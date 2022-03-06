export class Subreddit {
  constructor(public display_name: string) {}
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

export type LoadingStats = {
  loadedSubreddits: number;
  loadedMultis: number;
  processingData: boolean;
  loadedAllSubreddits: boolean;
};

export type LoadingStatsCallback =
  | {
      kind: "LoadedSubreddits";
      loadedSubreddits: number;
    }
  | {
      kind: "LoadedAllSubreddits";
    }
  | {
      kind: "LoadedMultis";
      loadedMultis: number;
    }
  | {
      kind: "processingData";
    };

export class NotificationEvent {
  constructor(
    readonly severity: "info" | "success" | "warn" | "error",
    readonly summary: string,
    readonly detail: string | undefined = undefined,
    readonly life: number = 3000
  ) {}
}
