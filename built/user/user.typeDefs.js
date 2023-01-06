"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
exports.default = (0, apollo_server_1.gql) `
  type User {
    id: Int!
    # realName: String
    userName: String!
    email: String!
    avatar: String
    # gender: Boolean
    # age: String
    # birth: String
    # bio: String
    # avatar: String
    # followers: [User]
    # following: [User]
    # totalFollowing: Int!
    # totalFollowers: Int!
    # isFollowing: Boolean!
    # isMe: Boolean!
    # rooms:[Room]
    deviceToken:String
    # blockUsers:[Int]
    # 이건 받을 필요 없으니까
    # blockedUsers:[Int]
    createdAt: String!
    # updatedAt: String!
    # posts 는 따로 받음. getUserPosts 로
    lastReadNotificationId: Int!
    # LogInUser 로 옮김
    # totalUnreadNotification: Int!
    # todayDiaries: [Diary]
  }
`;
