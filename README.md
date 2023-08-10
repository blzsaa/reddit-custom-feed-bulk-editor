# [reddit-custom-feed-bulk-editor](https://multireddit-editor.vercel.app)

Reddit-custom-feed-bulk-editor gives a UI to bulk edit custom-feeds in bulk.

## Features

- list all subreddits that either the user is subscribed or part of one of the user's custom feed
- list all custom feed of the user
- subscribe to or unsubscribe from any subreddits

## Development

- register a new app at https://www.reddit.com/prefs/apps/
  - category: installed app
  - redirect uri: http://localhost:8080/authorize_callback
  - name, about url: does not matter
- create a file named .env.local with the content:
  - ```
    VITE_CLIENT_ID=<<client id>>
    ```
  - where client_id comes from the registered reddit app
- run `npm ci`
- run `npm run vercel:dev`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) for git commit messages.
You can use `npx git-cz` to help with the formatting of the commit messages.

## License

[MIT](https://choosealicense.com/licenses/mit/)
