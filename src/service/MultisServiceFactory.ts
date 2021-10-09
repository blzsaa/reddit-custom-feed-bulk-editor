import { RedditApi } from "@/api/RedditApi";
import { MultisService } from "@/service/MultisService";
import axios from "axios";

export class MultisServiceFactory {
  public extractAccessToken(location: Location): MultisService {
    const hash = location.hash.substr(1);
    const result: Map<string, string> = hash
      .split("&")
      .reduce(function (res, item) {
        const parts = item.split("=");
        res.set(parts[0], parts[1]);
        return res;
      }, new Map<string, string>());
    const accessToken = result.get("access_token");
    if (accessToken === undefined) {
      throw new Error("accessToken is missing");
    }
    const axiosInstance = axios.create({
      baseURL: "https://oauth.reddit.com",
      timeout: 5000,
      headers: {
        Authorization: "bearer " + accessToken,
      },
    });
    return new MultisService(new RedditApi(axiosInstance));
  }
}
