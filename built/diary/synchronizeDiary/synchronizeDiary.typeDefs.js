"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  # 이거 될라나? 안되면 JSON 으로 하고
  input diaryFormat {
    title: String!,
    body: String!,
    # dateTime: String!,
    # 걍 Int 로 받을까?
    dateTime: Int!,
    youtubeId: String,
  }
  # type SynchronizeDiaryResponse {
  #   ok:Boolean!,
  #   error:String,
  #   # uploadedDiary:[Diary]
  # }
  type Mutation {
    synchronizeDiary(
      uploadDiaries:[diaryFormat]!
    ): MutationResponse!
  }
`;
