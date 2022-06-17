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
      }
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
      }
    ).as("retrieving all multireddits");
  });

  it("should load data to a visual table", () => {
    cy.visit(
      "/authorize_callback#code=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe"
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
      "/authorize_callback#access_token=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe"
    );

    cy.get(
      ":nth-child(3) > .p-column-filter > .p-fluid > .p-checkbox > .p-checkbox-box"
    ).click();

    getCellAt({ column: 1, row: 1 }).should("contain.text", "subreddit1");
    getCellAt({ column: 2, row: 1 }).should("contain.text", "subreddit4");

    cy.get(".subreddit1_multi1").shouldBeChecked();
    cy.get(".subreddit2_multi2").should("not.be.exist");
    cy.get(".subreddit4_multi2").shouldNotBeChecked();
  });
  it("should be able modify subscription and multis", () => {
    mockSaveMultiCall("multi1", ["subreddit4"]);
    mockSaveMultiCall("multi2", ["subreddit1", "subreddit3"]);
    mockSubscribeCall("subreddit3");
    mockUnsubscribeCall("subreddit1");

    loadPage();
    cy.get(".subreddit1_subscribed").click();
    cy.get(".subreddit3_subscribed").click();
    cy.get(".subreddit1_multi1").click();
    cy.get(".subreddit2_multi2").click();
    cy.get("#save-button").click();

    cy.get(".subreddit1_subscribed").shouldNotBeChecked();
    cy.get(".subreddit3_subscribed").shouldBeChecked();
    cy.get(".subreddit1_multi1").shouldNotBeChecked();
    cy.get(".subreddit2_multi2").shouldNotBeChecked();
    cy.wait("@sub-subreddit3");
    cy.wait("@unsub-subreddit1");
    cy.wait("@multi1");
    cy.wait("@multi2");
  });
  it("should be add new subreddit", () => {
    mockSaveMultiCall("multi2", [
      "subreddit1",
      "subreddit2",
      "subreddit3",
      "subreddit5",
    ]);
    mockSubscribeCall("subreddit5");

    loadPage();

    cy.intercept(
      {
        pathname: "/api/subreddit_autocomplete_v2",
        query: {
          query: "subreddit5",
        },
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              children: [
                { data: { display_name: "subreddit5" } },
                { data: { display_name: "subreddit5-with-suffix" } },
              ],
            },
          },
        });
      }
    ).as("subreddit5-search");

    cy.get("#open-add-new-subreddit-form-button").click();
    cy.focused().type("subreddit5");
    cy.wait("@subreddit5-search");
    cy.get("#add-new-subreddit-button").click();
    cy.get(".p-overlaypanel-close").click();
    cy.get(".subreddit5_subscribed").click();
    cy.get(".subreddit5_multi2").click();

    cy.get("#save-button").click();

    cy.get(".subreddit5_subscribed").shouldBeChecked();
    cy.get(".subreddit5_multi1").shouldNotBeChecked();
    cy.get(".subreddit5_multi2").shouldBeChecked();
    cy.wait("@sub-subreddit5");
    cy.wait("@multi2");
  });

  function loadPage() {
    cy.visit(
      "/authorize_callback#access_token=access_token&token_type=bearer&state=STATE&expires_in=3600&scope=mysubreddits+read+subscribe"
    );
  }

  function mockSaveMultiCall(name, newSubreddits) {
    const a = newSubreddits
      .map((s) => {
        return `{"name":"${s}"}`;
      })
      .join(",");
    return cy
      .intercept(
        {
          method: "PUT",
          pathname: `/api/multi/user/userName/m/${name}`,
          query: {
            model: `{"subreddits":[${a}]}`,
          },
        },
        { statusCode: 200 }
      )
      .as(name);
  }

  function mockSubChange(action, newSubreddit) {
    return cy
      .intercept(
        "POST",
        `https://oauth.mock-reddit.com/api/subscribe?action=${action}&sr_name=${newSubreddit}`,
        { statusCode: 200 }
      )
      .as(`${action}-${newSubreddit}`);
  }
  function mockSubscribeCall(newSubreddit) {
    return mockSubChange("sub", newSubreddit);
  }
  function mockUnsubscribeCall(unsubscribedSubreddit) {
    return mockSubChange("unsub", unsubscribedSubreddit);
  }

  function getHeaderAt(param) {
    return cy.get(
      `.p-datatable-thead > :nth-child(1) > :nth-child(${param.row})`
    );
  }
  function getCellAt(param) {
    return cy.get(
      `.p-datatable-tbody > :nth-child(${param.column}) > :nth-child(${param.row})`
    );
  }
});
