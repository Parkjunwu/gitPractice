import { gql } from "apollo-server-express";

export default gql`
  type Mutation {
    changeDiarySong(
      diaryId:Int!
      # musicUrl:String!
      # musicId:Int!
      youtubeId:String!
      password:String!
    ):MutationResponse!
  }
`;