module.exports = {
  emailField: [
    '~email',
    '~Email',
    'android=new UiSelector().resourceIdMatches(".*email.*")',
    'android=new UiSelector().className("android.widget.EditText").instance(0)',
  ],

  passwordField: [
    '~password',
    '~Password',
    'android=new UiSelector().resourceIdMatches(".*password.*")',
    'android=new UiSelector().className("android.widget.EditText").instance(1)',
  ],

  loginButton: [
    '~login',
    '~Login',
    'android=new UiSelector().text("Login")',
    'android=new UiSelector().resourceIdMatches(".*login.*")',
  ],

  dashboardIdentifier(expectedIdentifier) {
    return [
      `~${expectedIdentifier}`,
      `android=new UiSelector().textContains("${expectedIdentifier}")`,
      'android=new UiSelector().resourceIdMatches(".*dashboard.*")',
    ];
  },
};
