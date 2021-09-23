export class Subreddit {
  constructor(public display_name: string, public description_html: string) {}
}

export class MultiReddit {
  constructor(public display_name: string, public subreddits: string[]) {}
}

export class Asd {
  constructor(public display_name: string, public asd: Map<string, string>) {}
}
export class Row {
  constructor(public header: string, public field: string) {}
}
