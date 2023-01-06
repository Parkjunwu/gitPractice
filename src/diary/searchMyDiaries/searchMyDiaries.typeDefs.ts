import { gql } from "apollo-server-express";

export default gql`
  type SearchMyDiariesResponse {
    cursorId:Int
    hasNextPage:Boolean
    diaries:[Diary]
    error:String
  }
  type Query {
    searchMyDiaries(
      keyword:String!,
      cursorId:Int
    ):SearchMyDiariesResponse!
  }
`