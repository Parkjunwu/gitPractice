import { gql } from "apollo-server-express";

export default gql`
  type Mutation {
    requestSongChange(
      id:Int!,
      showDiary:Boolean!,
      requestMessage:String,
    ):MutationResponse!
  }
`;