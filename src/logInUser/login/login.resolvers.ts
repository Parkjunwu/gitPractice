const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import { Resolvers } from "../../types";
import { getRandomYtIdArr, getThisMonthCalendarData, getTodayDiaries, getTotalUnreadNotification, selectFieldForLogIn } from "../logInUser.util";

const resolver: Resolvers = {
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
          ...selectFieldForLogIn,
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
        if(userOnToken){
          return { ok: false, errorCode: "NOT_AUTHENTICATED" };
        } else {
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
      const todayDiaries = getTodayDiaries(userId);
      const totalUnreadNotification = getTotalUnreadNotification(userId,user.lastReadNotificationId);

      // 이번달 일기도 보냄
      const thisMonthData = await getThisMonthCalendarData(userId);

      // 타입 안적어도 되네. 일단 이래 써
      const ytIdArr = user.ytIdArr;
      const randomArr = getRandomYtIdArr(ytIdArr);
      
      const loggedInUser = {
        ...user,
        totalUnreadNotification,
        todayDiaries,
        thisMonthData,
        ...(randomArr && { prevYtIdArr:randomArr }),
      };
      
      // DB refreshToken 저장 구현해야함. 로그아웃 로직도 만들어서 DB refreshToken 삭제 구현

      return { ok: true, accessToken, refreshToken, loggedInUser };
    },
  },
};

export default resolver;
