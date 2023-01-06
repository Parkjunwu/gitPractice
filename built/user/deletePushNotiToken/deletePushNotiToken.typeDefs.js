"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const resolver = (0, apollo_server_express_1.gql) `
  type Mutation {
    deletePushNotiToken: MutationResponse!
  }
`;
exports.default = resolver;
