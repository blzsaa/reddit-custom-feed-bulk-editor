describe("In case of 401 unauthorized return vale from reddit", () => {
  Cypress.Commands.add("clickLink", (label) => {
    cy.get("a").contains(label).click();
  });
  Cypress.on("uncaught:exception", (err) => {
    if (err.message.includes("Request failed with status code 401")) {
      return false;
    }
  });
  beforeEach(() => {
    cy.intercept(
      {
        url: "https://www.mock-reddit.com/api/v1/access_token",
        auth: {
          username: "e2eClientId",
          password: "",
        },
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            access_token: "access_token",
          },
        });
      }
    ).as("retrieving the access token");

    cy.intercept(
      {
        url: "https://oauth.mock-reddit.com/subreddits/mine/subscriber?limit=100",
        headers: {
          authorization: "bearer access_token",
        },
      },
      (req) => {
        req.reply({
          statusCode: 401,
        });
      }
    ).as("retrieving all subreddits");
  });

  it("should redirect to Home and delete accessToken from store", () => {
    cy.visit(
      "/authorize_callback#code=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe"
    );

    cy.url().should("contain", "http://localhost:8080/");
    cy.get("span.p-toast-summary").should("have.length", 1);
    cy.get("span.p-toast-summary").invoke("text").should("eqls", "Timeout");
  });
});
