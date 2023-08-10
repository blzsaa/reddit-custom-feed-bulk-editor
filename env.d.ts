/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_OAUTH_REDDIT_URL: string;
  readonly VITE_REDDIT_URL: string;
  readonly VITE_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
