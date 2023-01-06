import { gql } from "apollo-server-express";

export default gql`
  type SeeMyDiaryResponse {
    diary:Diary
    prevDiaryId:Int
    nextDiaryId:Int
    error:String
  }
  type Query {
    seeMyDiary(
      id:Int!
    ):SeeMyDiaryResponse
  }
`;