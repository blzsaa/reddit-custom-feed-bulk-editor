import { describe, it, expect, afterEach, vi } from "vitest";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { AxiosInstance } from "axios";
import { Matcher, mock } from "vitest-mock-extended";

describe("AccessTokenFactory.ts", () => {
  const axiosInstance = mock<AxiosInstance>();
  const accessTokenFactory = new AccessTokenFactory();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when calling extractAccessToken with location containing code", function () {
    it("should call access_token api with it", async function () {
      const code = "MYCODE";
      const redirectUri = encodeURIComponent(
        "http://localhost:8080/authorize_callback"
      );
      const href = `https://localhost:8080?code=${code}`;
      axiosInstance.post
        .calledWith(
          "/api/v1/access_token",
          `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
          new Matcher(
            (actualValue) =>
              "myClientId" === actualValue?.auth?.username &&
              "" === actualValue?.auth?.password,
            "matcher"
          )
        )
        .mockResolvedValue({
          data: {
            access_token: "expectedAccessToken",
          },
        });

      const actual = await accessTokenFactory.extractAccessToken(
        axiosInstance,
        href
      );

      expect(actual).to.be.eql("expectedAccessToken");
    });
  });
});
