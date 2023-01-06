
const jwt = require("jsonwebtoken");
import { Resolvers } from "../../types";
import { getRandomYtIdArr, getThisMonthCalendarData, getTodayDiaries, getTotalUnreadNotification, selectFieldForLogIn } from "../logInUser.util";

const resolver: Resolvers = {
  Mutation: {
    autoLogin: async (_, { token }, { client }) => {
      // DB refreshToken 확인 구현해야함. 먼저 확인해서 없으면 로그인 안되게. 안그러면 refreshToken 이 여러개 굴러댕기고 대응 못함.
      try {
        const { id } = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
        
        if(!id) {
          return {ok:false, error:"invalid token"};
        }

        const user = await client.user.findUnique({
          where:{
            id,
          },
          select:selectFieldForLogIn,
        });
        
        if (user) {
          // id 가 user.id 랑 같아서 걍 id 로 보내줌
          const accessToken = await jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30m' });
          
          // autoLogin 시점엔 user 의 resolver 의 context 에 loggedInUser 가 null 이라 못받아서 따로 받아야함.
          const todayDiaries = getTodayDiaries(id);
          const totalUnreadNotification = getTotalUnreadNotification(id,user.lastReadNotificationId);

          // 이번달 일기도 보냄
          const thisMonthData = await getThisMonthCalendarData(user.id);

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

          return { ok:true, loggedInUser, accessToken };
        } else {
          return { ok:false, error:"no user" };
        }
      } catch (e) {
        console.error("autoLogin error : e")
        return { ok:false, error:"autoLogin server error" };
      }
    },
  },
};

export default resolver;
