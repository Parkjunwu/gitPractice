"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
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
