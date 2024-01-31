describe("Editor page", () => {
  Cypress.Commands.add("clickLink", (label) => {
    cy.get("a").contains(label).click();
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
      },
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
          statusCode: 200,
          body: {
            data: {
              after: null,
              children: [
                {
                  data: {
                    display_name: "subreddit1",
                  },
                },
                {
                  data: {
                    display_name: "subreddit2",
                  },
                },
              ],
            },
          },
        });
      },
    ).as("retrieving all subreddits");

    cy.intercept(
      {
        url: "https://oauth.mock-reddit.com/api/multi/mine",
        headers: {
          authorization: "bearer access_token",
        },
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [
            {
              data: {
                display_name: "multi1",
                subreddits: [{ name: "subreddit1" }, { name: "subreddit4" }],
                path: "/user/userName/m/multi1/",
              },
            },
            {
              data: {
                display_name: "multi2",
                subreddits: [
                  { name: "subreddit1" },
                  { name: "subreddit2" },
                  { name: "subreddit3" },
                ],
                path: "/user/userName/m/multi2/",
              },
            },
          ],
        });
      },
    ).as("retrieving all multireddits");
  });

  it("should load data to a visual table", () => {
    cy.visit(
      "/authorize_callback#code=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe",
    );

    getHeaderAt({ row: 1 }).should("contain.text", "name");
    getHeaderAt({ row: 2 }).should("contain.text", "subscribed");
    getHeaderAt({ row: 4 }).should("contain.text", "multi2");

    getCellAt({ column: 1, row: 1 }).should("contain.text", "subreddit1");
    getCellAt({ column: 3, row: 1 }).should("contain.text", "subreddit3");

    cy.get(".subreddit1_multi1").shouldBeChecked();
    cy.get(".subreddit2_multi2").shouldBeChecked();
    cy.get(".subreddit3_multi1").shouldNotBeChecked();
    cy.get(".subreddit4_multi2").shouldNotBeChecked();
  });

  it("should be able to filter data", () => {
    cy.visit(
      "/authorize_callback#access_token=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe",
    );

    cy.get(
      ":nth-child(3) > .p-column-filter > .p-fluid > .p-checkbox > .p-checkbox-box",
    ).click();

    getCellAt({ column: 1, row: 1 }).should("contain.text", "subreddit1");
    getCellAt({ column: 2, row: 1 }).should("contain.text", "subreddit4");

    cy.get(".subreddit1_multi1").shouldBeChecked();
    cy.get(".subreddit2_multi2").should("not.be.exist");
    cy.get(".subreddit4_multi2").shouldNotBeChecked();
  });
  it("should be able modify subscription and multis", () => {
    cy.intercept(
      "PUT",
      "https://oauth.mock-reddit.com/api/multi/user/userName/m/multi1/*",
      { statusCode: 200 },
    ).as("multi1");
    cy.intercept(
      "PUT",
      "https://oauth.mock-reddit.com/api/multi/user/userName/m/multi2/*",
      {
        statusCode: 200,
      },
    ).as("multi2");
    cy.intercept(
      "POST",
      "https://oauth.mock-reddit.com/api/subscribe?action=sub&sr_name=subreddit3",
      { statusCode: 200 },
    ).as("sub");
    cy.intercept(
      "POST",
      "https://oauth.mock-reddit.com/api/subscribe?action=unsub&sr_name=subreddit1",
      { statusCode: 200 },
    ).as("unsub");
    cy.intercept(
      "GET",
      "https://oauth.mock-reddit.com/api/subreddit_autocomplete_v2?query=subreddit&*",
      {
        statusCode: 200,
        body: {
          data: {
            children: [
              { data: { display_name: "new-subreddit1" } },
              { data: { display_name: "new-subreddit2" } },
              { data: { display_name: "new-subreddit3" } },
            ],
          },
        },
      },
    );
    cy.intercept(
      "GET",
      "https://oauth.mock-reddit.com/api/subreddit_autocomplete_v2?query=new-subreddit3&*",
      {
        statusCode: 200,
        body: {
          data: {
            children: [{ data: { display_name: "new-subreddit3" } }],
          },
        },
      },
    );

    cy.visit(
      "/authorize_callback#access_token=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe",
    );
    cy.get(".subreddit1_subscribed").click();
    cy.get(".subreddit3_subscribed").click();
    cy.get(".subreddit1_multi1").click();
    cy.get(".subreddit2_multi2").click();
    cy.get("#menu-btn").click();
    cy.get("#ac").type("subreddit");
    cy.get(".p-autocomplete-items>li").should("have.length", 3);
    cy.get("#ac").type("{downArrow}");
    cy.get("#ac").type("{downArrow}");
    cy.get("#ac").type("{enter}");
    cy.get("#add-new-subreddit-button").click();
    cy.get(".p-sidebar-close").click();
    cy.get(".new-subreddit3_multi2").click();
    cy.get("#save-btn").click();

    cy.get(".subreddit1_subscribed").shouldNotBeChecked();
    cy.get(".subreddit3_subscribed").shouldBeChecked();
    cy.get(".subreddit1_multi1").shouldNotBeChecked();
    cy.get(".subreddit2_multi2").shouldNotBeChecked();
    cy.get(".new-subreddit3_subscribed").shouldNotBeChecked();
    cy.get(".new-subreddit3_multi1").shouldNotBeChecked();
    cy.get(".new-subreddit3_multi2").shouldBeChecked();
    cy.wait("@sub");
    cy.wait("@unsub");
    cy.wait("@multi1")
      .its("request.url")
      .should("not.include", "subreddit1")
      .and("not.include", "subreddit2")
      .and("not.include", "subreddit3")
      .and("include", "subreddit4")
      .and("not.include", "new-subreddit3");
    cy.wait("@multi2")
      .its("request.url")
      .should("include", "subreddit1")
      .and("not.include", "subreddit2")
      .and("include", "subreddit3")
      .and("not.include", "subreddit4")
      .and("include", "new-subreddit3");
  });

  function getHeaderAt(param) {
    return cy.get(
      `.p-datatable-thead > :nth-child(1) > :nth-child(${param.row})`,
    );
  }
  function getCellAt(param) {
    return cy.get(
      `.p-datatable-tbody > :nth-child(${param.column}) > :nth-child(${param.row})`,
    );
  }
});
