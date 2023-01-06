import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";

const readNotificationFn: Resolver = async(_,{lastReadNotificationId},{client,logInUserId}) => { 
  try {

    await client.user.update({
      where:{
        id:logInUserId,
      },
      data:{
        lastReadNotificationId,
      },
      select:{
        id:true,
      },
    });

  } catch (e) {
    console.log("readNotification // error : " + e);

    return {ok:false, error:"알 수 없는 에러입니다. 같은 문제가 계속 발생 시 문의 주시면 감사드리겠습니다."};
  };

  return {ok:true};
};

const resolver: Resolvers = {
  Mutation: {
    readNotification: protectResolver(readNotificationFn),
  },
};

export default resolver;