Cypress.Commands.add(
  "shouldBeChecked",
  { prevSubject: "element" },
  (subject) => {
    return cy.get(subject).should("have.class", "p-checkbox-checked");
  },
);

Cypress.Commands.add(
  "shouldNotBeChecked",
  { prevSubject: "element" },
  (subject) => {
    return cy.get(subject).should("not.have.class", "p-checkbox-checked");
  },
);
