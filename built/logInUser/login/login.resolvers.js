"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logInUser_util_1 = require("../logInUser.util");
const resolver = {
    Mutation: {
        login: async (_, { email, password }, { client }) => {
            // 이메일 양식 확인은 뭐 안해도 되겠지?
            const noUserError = "NO_USER";
            const user = await client.user.findUnique({
                where: {
                    email,
                },
                select: {
                    password: true,
                    ...logInUser_util_1.selectFieldForLogIn,
                },
            });
            if (!user) {
                const userOnToken = await client.tokenForCreateAccount.findUnique({
                    where: {
                        email,
                    },
                    select: {
                        id: true,
                    },
                });
                if (userOnToken) {
                    return { ok: false, errorCode: "NOT_AUTHENTICATED" };
                }
                else {
                    return { ok: false, errorCode: noUserError };
                }
            }
            const passwordOk = await bcrypt.compare(password, user.password);
            if (!passwordOk) {
                return { ok: false, errorCode: noUserError };
            }
            const userId = user.id;
            const accessToken = await jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30m' });
            const refreshToken = await jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
            // login 시점엔 user 의 resolver 의 context 에 loggedInUser 가 null 이라 못받아서 따로 받아야함.
            const todayDiaries = (0, logInUser_util_1.getTodayDiaries)(userId);
            const totalUnreadNotification = (0, logInUser_util_1.getTotalUnreadNotification)(userId, user.lastReadNotificationId);
            // 이번달 일기도 보냄
            const thisMonthData = await (0, logInUser_util_1.getThisMonthCalendarData)(userId);
            // 타입 안적어도 되네. 일단 이래 써
            const ytIdArr = user.ytIdArr;
            const randomArr = (0, logInUser_util_1.getRandomYtIdArr)(ytIdArr);
            const loggedInUser = {
                ...user,
                totalUnreadNotification,
                todayDiaries,
                thisMonthData,
                ...(randomArr && { prevYtIdArr: randomArr }),
            };
            // DB refreshToken 저장 구현해야함. 로그아웃 로직도 만들어서 DB refreshToken 삭제 구현
            return { ok: true, accessToken, refreshToken, loggedInUser };
        },
    },
};
exports.default = resolver;
