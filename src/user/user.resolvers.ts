import { Resolvers } from "../types";

const resolver: Resolvers = {
  User: {

    // 얘는 logInUserId 안바꿈
    // 얘네는 어차피 logIn, autoLogIn, useMe 에서만 써서 LogInUser 타입 따로 만듦.
    // totalUnreadNotification: ({ id,lastReadNotificationId }, _, { loggedInUser }) => {
    //   if(!loggedInUser || loggedInUser.id !== id) {
    //     // return null; // Int! 라서 걍 0 으로 함.
    //     console.error("totalUnreadNotification // 로그인 안한 / 다른 유저가 안읽은 메세지 갯수 조회. 해킹 가능성 있음");
    //     return 0;
    //   }
      
    //   return getTotalUnreadNotification(id,lastReadNotificationId);
    // },

    // todayDiaries: async ({ id }, _, { loggedInUser }) =>{
    //   // loggedInUser 이 없을 수 있음. 로그인 안해서 header 없거나 한 상태면.
    //   if(!loggedInUser || loggedInUser.id !== id) {
    //     console.error("todayDiaries // 로그인 안한 / 다른 유저가 안읽은 메세지 갯수 조회. 해킹 가능성 있음");
    //     return null;
    //   }

    //   return getTodayDiaries(loggedInUser.id);
    // },
    
    // totalFollowing: async ({ id }, _, { client }) =>
    //   client.user.count({
    //     where: {
    //       followers: {
    //         some: { id },
    //       },
    //     },
    //   }),
    // totalFollowers: ({ id }, _, { client }) =>
    //   client.user.count({
    //     where: {
    //       following: {
    //         some: { id },
    //       },
    //     },
    //   }),
    // isMe: ({ id }, _, { loggedInUser }) => id === loggedInUser?.id,
    // //애매해
    // isFollowing: async ({ id }, _, { client, loggedInUser }) => {
    //   if (!loggedInUser) return false;
    //   const exist = await client.user.count({
    //     where: {
    //       id: loggedInUser.id,
    //       following: {
    //         some: {
    //           id,
    //         },
    //       },
    //     },
    //   });
    //   return Boolean(exist);
    // },
    
  },
};

export default resolver;
