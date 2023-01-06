import { gql } from "apollo-server";

export default gql`
  type Query {
    checkUserName(
      userName: String!
    ): Boolean!
  }
`;

