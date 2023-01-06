"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
// 일단 쓰진 않음. 걍 push noti 에서 commentId 받아서 seeComments로 받음.
exports.default = (0, apollo_server_express_1.gql) `
  type GetNotifiedDiaryResponse {
    diary:Diary
    error:String
  }
  type Query {
    getNotifiedDiary(
      diaryId:Int!
      # 댓글이나 유저를 삭제했거나 해서 못받을 수 있음. 필수 아닌걸로
    ):GetNotifiedDiaryResponse!
  }
`;
