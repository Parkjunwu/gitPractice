"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
exports.default = (0, apollo_server_1.gql) `
  type Mutation {
    editProfile(
      # realName
      # gender
      # birth
      # blockUsers
      # firstName: String
      # lastName: String
      userName: String
      # email: String
      # password 는 그냥 따로
      # password: String
      # bio: String
      avatar: Upload
      deleteAvatar: Boolean
    ):MutationResponse!
  }
`;
