describe("Login page", () => {
  it("should welcome user", () => {
    cy.visit("/");

    cy.contains(
      ".hello > p",
      "To use this page you first have to allow reddit-custom-feed-bulk-editor to access which subreddits and multireddits you are subscriber to."
    );
  });

  it("should have a link towards reddit", () => {
    cy.visit("/");

    cy.get("a")
      .should("have.attr", "href")
      .and(
        "eq",
        "https://www.reddit.com/api/v1/authorize?" +
          "client_id=e2eClientId&" +
          "response_type=code&" +
          "state=STATE&" +
          "redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fauthorize_callback&" +
          "duration=temporary&" +
          "scope=mysubreddits%20read%20subscribe"
      );
  });
});
