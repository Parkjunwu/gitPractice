"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  enum CreateRawAccountErrorCode {
    USERNAME
    EMAIL
    UNKNOWN
    INVALID_INPUT
    ALREADY_TOKEN
  }
  type CreateRawAccountResponse {
    ok:Boolean!
    # error:ErrorCode
    errorCode:CreateRawAccountErrorCode
  }
  type Mutation {
    createRawAccount(
      email: String!
      password: String!
      userName: String!
      # String 으로 받고 Int 로 저장
    ):CreateRawAccountResponse!
  }
`;
