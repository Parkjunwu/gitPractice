"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../user.utils");
const deletePushNotiTokenFn = async (_, __, 
// { loggedInUser, client }
{ logInUserId, client }) => {
    await client.user.update({
        where: {
            // id:loggedInUser.id,
            id: logInUserId,
        },
        data: {
            deviceToken: null,
        },
        select: {
            id: true
        },
    });
    return { ok: true };
};
const resolver = {
    Mutation: {
        deletePushNotiToken: (0, user_utils_1.protectResolver)(deletePushNotiTokenFn),
    },
};
exports.default = resolver;
