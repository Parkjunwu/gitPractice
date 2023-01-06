"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
exports.default = (0, apollo_server_1.gql) `
  type LogInUser {
    id: Int!
    userName: String!
    avatar: String
    totalDiary: Int!
    totalUnreadNotification: Int!
    todayDiaries: [Diary]
    thisMonthData: [Calendar]
    # ytIdArr: JSON # 그냥 [String] 으로 안되나? 어차피 JSON 은 prisma 에서만 쓰는 앤데?
    prevYtIdArr: [String!] #[String]! 이 아님. [String!] 은 [] 가능.
  }
`;
