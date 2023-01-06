import { gql } from "apollo-server-express";

export default gql`
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
