import { gql } from "apollo-server";

export default gql`
  type Mutation {
    verifyEmailToken(
      token: String!
      email: String!
    ): MutationResponse!
  }
`;
