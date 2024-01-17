import type { KyInstance } from "ky";

export class AccessTokenFactory {
  public async extractAccessToken(
    instance: KyInstance,
    href: string,
  ): Promise<string> {
    const code = new URL(href).searchParams.get("code");
    const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);

    const username = import.meta.env.VITE_CLIENT_ID;
    const password = "";
    const response: { access_token: string } = await instance
      .post("api/v1/access_token", {
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(username + ":" + password),
        },
      })
      .json();
    return response.access_token;
  }
}
