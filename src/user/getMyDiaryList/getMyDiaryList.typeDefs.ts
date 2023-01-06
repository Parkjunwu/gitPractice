import { gql } from "apollo-server-express";

export default gql`
  type GetMyDiaryListResponse {
    cursorId:Int
    hasNextPage:Boolean
    diaries:[Diary]
    error:String
    # isNotFetchMore:Boolean
  }
  type Query {
    getMyDiaryList(cursorId:Int):GetMyDiaryListResponse!
  }
`;