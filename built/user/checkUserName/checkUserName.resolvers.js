"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../user.utils");
const resolverFn = async (_, { userName }) => (0, user_utils_1.checkUserNameOnUser)(userName);
const resolver = {
    Query: {
        checkUserName: resolverFn,
    },
};
exports.default = resolver;
