"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
// 다른 사람도 볼거면 바꿔
exports.default = (0, apollo_server_express_1.gql) `
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
