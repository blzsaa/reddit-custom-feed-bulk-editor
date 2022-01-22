import { expect } from "chai";
import sinon, { stubInterface } from "ts-sinon";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { AxiosInstance, AxiosResponse } from "axios";

describe("AccessTokenFactory.ts", () => {
  const axiosInstance = stubInterface<AxiosInstance>();
  const accessTokenFactory = new AccessTokenFactory();

  afterEach(() => {
    sinon.reset();
  });

  describe("when calling extractAccessToken with location containing code", function () {
    it("should call access_token api with it", async function () {
      const code = "MYCODE";
      const redirectUri = encodeURIComponent(
        "http://localhost:8080/authorize_callback"
      );
      const href = `https://localhost:8080?code=${code}`;
      axiosInstance.post
        .withArgs(
          "/api/v1/access_token",
          `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
          {
            auth: { username: "myClientId", password: "" },
          }
        )
        .returns(
          withAxiosResponse({
            access_token: "expectedAccessToken",
          })
        );

      const actual = await accessTokenFactory.extractAccessToken(
        axiosInstance,
        href
      );

      expect(actual).to.be.eql("expectedAccessToken");
    });
  });

  function withAxiosResponse<T>(t: T): Promise<AxiosResponse<T>> {
    return new Promise((resolve) => {
      const axiosResponse = stubInterface<AxiosResponse>();
      axiosResponse.data = t;
      resolve(axiosResponse);
    });
  }
});
