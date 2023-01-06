import { gql } from "apollo-server-express";

export default gql`
  type Mutation {
    deleteDiary(
      id: Int!  
    ): MutationResponse!
  }
`;