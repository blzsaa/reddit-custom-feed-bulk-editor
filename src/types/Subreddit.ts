export class Subreddit {
  constructor(public display_name: string, public description_html: string) {}
}

export class MultiReddit {
  constructor(public display_name: string, public subreddits: string[]) {}
}
