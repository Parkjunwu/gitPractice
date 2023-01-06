"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../../user/user.utils");
// const readNotificationFn: Resolver = async(_,{lastReadNotificationId},{client,loggedInUser}) => { 
const readNotificationFn = async (_, { lastReadNotificationId }, { client, logInUserId }) => {
    try {
        await client.user.update({
            where: {
                // id:loggedInUser.id,
                id: logInUserId,
            },
            data: {
                lastReadNotificationId,
            },
            select: {
                id: true,
            },
        });
    }
    catch (e) {
        console.log("readNotification // error : " + e);
        return { ok: false, error: "알 수 없는 에러입니다. 같은 문제가 계속 발생 시 문의 주시면 감사드리겠습니다." };
    }
    ;
    return { ok: true };
};
const resolver = {
    Mutation: {
        readNotification: (0, user_utils_1.protectResolver)(readNotificationFn),
    },
};
exports.default = resolver;
