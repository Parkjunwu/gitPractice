"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  type SeeUserNotificationListResponse {
    cursorId:Int
    hasNextPage:Boolean
    notification:[Notification]
    error:String
    # 프론트엔드에서 subscription 데이터 받기 위함... 다른 방법이 안떠오름.
    isNotFetchMore:Boolean
  }
  type Query {
    seeUserNotificationList(
      cursorId:Int
    ):SeeUserNotificationListResponse
  }
`;
