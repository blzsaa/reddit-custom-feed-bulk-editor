import type { AxiosInstance } from "axios";

export class AccessTokenFactory {
  public async extractAccessToken(
    instance: AxiosInstance,
    href: string,
  ): Promise<string> {
    console.log(import.meta.env.VITE_CLIENT_ID);
    const code = new URL(href).searchParams.get("code");
    const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
    const response: { data: { access_token: string } } = await instance.post(
      "/api/v1/access_token",
      `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
      {
        auth: {
          username: import.meta.env.VITE_CLIENT_ID,
          password: "",
        },
      },
    );
    return response.data.access_token;
  }
}
