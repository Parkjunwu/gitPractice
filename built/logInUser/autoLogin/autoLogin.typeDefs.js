"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
exports.default = (0, apollo_server_1.gql) `
  # type AutoLogInUser {
  #   id: Int!
  #   userName: String!
  #   totalUnreadNotification: Int!
  #   todayDiaries: [Diary]
  # }
  type LoginResult {
    ok: Boolean!
    error: String
    # loggedInUser: User // User 에서 resolver 있는 애를 받을 거라 따로 써야함. context 에서 loggedInUser 를 못받음.
    # loggedInUser: AutoLogInUser
    loggedInUser: LogInUser
    accessToken: String
  }
  type Mutation {
    autoLogin(token: String!): LoginResult!
  }
`;
