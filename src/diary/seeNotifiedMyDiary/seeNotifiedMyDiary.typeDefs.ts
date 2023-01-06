import { gql } from "apollo-server-express";

// 다른 사람도 볼거면 바꿔
export default gql`
  type SeeNotifiedMyDiaryResponse {
    diary:Diary
    error:String
  }
  type Query {
    seeNotifiedMyDiary(
      id:Int!
    ):SeeNotifiedMyDiaryResponse
  }
`;