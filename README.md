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
    VUE_APP_CLIENT_ID=<<client id>>
    VUE_APP_REDIRECT_URI = http://localhost:8080/authorize_callback
    ```
  - where client_id comes from the registered reddit app
- run `npm install`
- run `npm serve`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
