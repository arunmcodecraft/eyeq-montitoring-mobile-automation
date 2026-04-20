Feature: Login
  As a mobile app user
  I want to log in with valid credentials
  So that I can access the application

  @smoke @login
  Scenario: Successful login with default credentials
    Given the user is on the login screen
    When the user logs in with valid credentials
    Then the user should land on the dashboard

  @DataFile:src/data/testData.json @DataPath:validUser @smoke1
  Scenario: Successful login with JSON hook data
    Given the user is on the login screen
    When Login with username "td.username" and password "td.password"
    Then the user should land on the dashboard

  @DataFile:src/data/loginData.csv @Key:Login_02 @Env:STG @smoke1
  Scenario: Successful login with CSV hook data
    Given the user is on the login screen
    When Login with username "td.username" and password "td.password"
    Then the user should land on the dashboard
