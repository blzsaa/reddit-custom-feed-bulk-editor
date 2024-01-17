import { describe, it, expect, afterEach, vi } from "vitest";
import { KyInstance, ResponsePromise } from "ky";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { mock } from "vitest-mock-extended";

describe("AccessTokenFactory.ts", () => {
  const httpClient = mock<KyInstance>();

  const accessTokenFactory = new AccessTokenFactory();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when calling extractAccessToken with location containing code", function () {
    it("should call access_token api with it", async function () {
      const code = "MYCODE";
      const redirectUri = encodeURIComponent(
        "http://localhost:8080/authorize_callback",
      );
      const href = `https://localhost:8080?code=${code}`;
      httpClient.post.mockImplementation(() =>
        withKyResponse({ access_token: "expectedAccessToken" }),
      );

      const actual = await accessTokenFactory.extractAccessToken(
        httpClient,
        href,
      );

      expect(actual).to.be.eql("expectedAccessToken");
      expect(httpClient.post).toBeCalledWith("api/v1/access_token", {
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: "Basic bXlDbGllbnRJZDo=",
        },
      });
    });
  });

  function withKyResponse<T>(t: T) {
    const responsePromise = mock<ResponsePromise>();
    responsePromise.json.mockReturnValue(Promise.resolve(t));
    return responsePromise;
  }
});
