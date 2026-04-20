module.exports = {
  emailField: [
    '~email',
    '~Email',
    '-ios predicate string:type == "XCUIElementTypeTextField" AND (name CONTAINS[c] "email" OR label CONTAINS[c] "email")',
  ],

  passwordField: [
    '~password',
    '~Password',
    '-ios predicate string:type == "XCUIElementTypeSecureTextField" OR name CONTAINS[c] "password"',
  ],

  loginButton: [
    '~login',
    '~Login',
    '-ios predicate string:type == "XCUIElementTypeButton" AND (name CONTAINS[c] "login" OR label CONTAINS[c] "login")',
  ],

  dashboardIdentifier(expectedIdentifier) {
    return [
      `~${expectedIdentifier}`,
      `-ios predicate string:name CONTAINS[c] "${expectedIdentifier}" OR label CONTAINS[c] "${expectedIdentifier}"`,
    ];
  },
};
