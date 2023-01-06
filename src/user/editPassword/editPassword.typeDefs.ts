import { gql } from "apollo-server";

export default gql`
  type Mutation {
    editPassword(
      password: String!
    ):MutationResponse!
  }
`;
