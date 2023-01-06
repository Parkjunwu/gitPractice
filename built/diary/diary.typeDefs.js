"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  # scalar JSON # 지금 안씀. 나중에 쓰면 다시 바꾸고 resolver 도 변경
  type Diary {
    id: Int!
    user: User!
    title: String!

    # JSON 형식임
    # body: JSON
    # file: JSON
    body: [String!]!
    file: [String!]!
    # musicUrl: String
    createdAt: String!
    updatedAt: String!
    # isMine: Boolean!
    # 동영상으로 받을 수도 있으니까 ThumbNail 로 저장하자
    thumbNail: String
    summaryBody: String
    # # 굳이 comment 가 필요하면 like 제일 많은 하나 가져오기. 근데 그런건 없을듯?
    # likes: Int!
    # # comments: [Comment]
    # commentNumber: Int!
    # isLiked: Boolean!
    # accused: [Int]

    # music: Music

    youtubeId: String
    dateTime: Int!
  }
`;
