"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
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
