import { gql } from "apollo-server-express";

export default gql`
  type Mutation {
    resendEmail(
      email: String!
    ): MutationResponse!
  }
`;
