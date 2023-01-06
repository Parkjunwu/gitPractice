"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  enum LoginErrorCode {
    NO_USER
    NOT_AUTHENTICATED
  }
  type LoginResult {
    ok: Boolean!
    accessToken: String
    refreshToken: String
    errorCode: LoginErrorCode
    # loggedInUser: AutoLogInUser
    loggedInUser: LogInUser
  }
  type Mutation {
    login(email: String!, password: String!): LoginResult!
  }
`;
