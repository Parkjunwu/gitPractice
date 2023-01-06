import { gql } from "apollo-server-express";

export default gql`
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
