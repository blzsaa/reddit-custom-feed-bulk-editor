import { AxiosInstance } from "axios";

export class AccessTokenFactory {
  public async extractAccessToken(
    instance: AxiosInstance,
    href: string
  ): Promise<string> {
    const code = new URL(href).searchParams.get("code");
    const redirectUri = encodeURIComponent(process.env.VUE_APP_REDIRECT_URI);
    const response: { data: { access_token: string } } = await instance.post(
      "/api/v1/access_token",
      `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
      {
        auth: {
          username: process.env.VUE_APP_CLIENT_ID,
          password: "",
        },
      }
    );
    return response.data.access_token;
  }
}
