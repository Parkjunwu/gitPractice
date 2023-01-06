"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const logInUser_util_1 = require("../logInUser.util");
const resolver = {
    Mutation: {
        autoLogin: async (_, { token }, { client }) => {
            // DB refreshToken 확인 구현해야함. 먼저 확인해서 없으면 로그인 안되게. 안그러면 refreshToken 이 여러개 굴러댕기고 대응 못함.
            try {
                const { id } = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
                if (!id) {
                    return { ok: false, error: "invalid token" };
                }
                const user = await client.user.findUnique({
                    where: {
                        id,
                    },
                    select: logInUser_util_1.selectFieldForLogIn,
                });
                if (user) {
                    // id 가 user.id 랑 같아서 걍 id 로 보내줌
                    const accessToken = await jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30m' });
                    // autoLogin 시점엔 user 의 resolver 의 context 에 loggedInUser 가 null 이라 못받아서 따로 받아야함.
                    const todayDiaries = (0, logInUser_util_1.getTodayDiaries)(id);
                    const totalUnreadNotification = (0, logInUser_util_1.getTotalUnreadNotification)(id, user.lastReadNotificationId);
                    // 이번달 일기도 보냄
                    const thisMonthData = await (0, logInUser_util_1.getThisMonthCalendarData)(user.id);
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
                    return { ok: true, loggedInUser, accessToken };
                }
                else {
                    return { ok: false, error: "no user" };
                }
            }
            catch (e) {
                console.error("autoLogin error : e");
                return { ok: false, error: "autoLogin server error" };
            }
        },
    },
};
exports.default = resolver;
