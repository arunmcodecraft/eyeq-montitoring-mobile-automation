Feature: Dashboard
  As an authenticated user
  I want to view the dashboard
  So that I can confirm login completed

  @regression @dashboard
  Scenario: Dashboard placeholder validation
    Given the user is on the login screen
    When the user logs in with valid credentials
    Then the user should land on the dashboard
