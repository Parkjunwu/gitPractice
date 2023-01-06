"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  enum CreateAccountErrorCode {
    USERNAME
    EMAIL
    UNKNOWN
    INVALID_INPUT
    ALREADY_TOKEN
  }
  type CreateAccountResponse {
    ok:Boolean!
    # error:ErrorCode
    errorCode:CreateAccountErrorCode
  }
  type Mutation {
    createAccount(
      email: String!
      password: String!
      userName: String!
      # realName: String
      # String 으로 받고 Int 로 저장
      # birth: String
      # gender: Boolean
    ):CreateAccountResponse!
  }
`;
