export const config = {
  matcher: [
    "/api/:a",
    "/api/:a/:b",
    "/api/:a/:b/:c",
    "/api/:a/:b/:c/:d",
    "/api/:a/:b/:c/:d/:e",
    "/subreddits/:a/:b/:c/:d/:e",
    "/subreddits/:a",
    "/subreddits/:a/:b",
    "/subreddits/:a/:b/:c",
    "/subreddits/:a/:b/:c/:d",
    "/subreddits/:a/:b/:c/:d/:e",
  ],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const newUrl = "https://oauth.reddit.com" + url.pathname + url.search;
  return await fetch(newUrl, {
    headers: [
      ["accept", "application/json, text/plain, */*"],
      ["authorization", request.headers.get("authorization") || ""],
    ],
    method: request.method,
  });
}
