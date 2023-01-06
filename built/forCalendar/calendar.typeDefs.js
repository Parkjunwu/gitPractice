"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
// 걍 json 으로 보낼까? 굳이 이래 할 필요가 있을라나?
exports.default = (0, apollo_server_express_1.gql) `
  type Calendar {
    id: Int!
    title: String!
    date: Int!
    summaryBody: String
  }
`;
