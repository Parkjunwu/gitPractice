"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
// 근데 지금은 알림때문에 Notification 으로 보내는 거였는데 만약 알림이 이 subscription 로 되는게 아니면 그냥 true 만 보내면 되겠네. 걍 새 알림이 있다는 거만 알면 되니까.
exports.default = (0, apollo_server_express_1.gql) `
  type Subscription{
    # userNotificationUpdate(userId:Int!):Notification
    userNotificationUpdate:Notification
  }
`;
