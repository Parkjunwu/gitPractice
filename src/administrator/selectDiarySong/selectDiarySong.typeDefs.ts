import { gql } from "apollo-server-express";

export default gql`
  type Mutation {
    selectDiarySong(
      diaryId:Int!
      # musicUrl:String!
      # musicId:Int!
      youtubeId:String!
      password:String!
    ):MutationResponse!
  }
`;