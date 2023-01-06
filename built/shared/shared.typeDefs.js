"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  type MutationResponse {
    ok:Boolean!
    id:Int
    error:String
  }
  interface CursorPagination {
    cursorId:Int,
    hasNextPage:Boolean,
    error:String,
  }
`;
