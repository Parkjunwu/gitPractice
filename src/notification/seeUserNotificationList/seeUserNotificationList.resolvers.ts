import paginationErrorCheckNeedLogicAndQueryName from "../../paginationErrorCheckNeedLogicAndQueryName";
import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";

// const logicSeeUserNotificationList: Resolver = async(_,{cursorId},{client,loggedInUser}) => {
const logicSeeUserNotificationList: Resolver = async(_,{cursorId},{client,logInUserId}) => {

  const take = 20;

  // // 차단유저 찾음
  // const getBlockUsers = await client.user.findUnique({
  //   where:{
  //     id:loggedInUser.id,
  //   },
  //   select:{
  //     blockUsers:true,
  //   },
  // });

  // const blockUserIds = getBlockUsers.blockUsers.map(user=>user.id);
  // const isBlockUser = blockUserIds.length !== 0;

  // const notification = await client.notification.findMany({
  //   where:{
  //     OR:[
  //       // 그 외
  //       {
  //         subscribeUserId:loggedInUser.id,
  //         // 차단유저 있는 경우
  //         ...(isBlockUser && {
  //           publishUserId:{
  //             notIn:blockUserIds,
  //           },
  //         }),
  //       },
  //       // 팔로잉한 사람이 post 올렸을 때
  //       {
  //         AND:[
  //           {
  //             // which:"FOLLOWING_WRITE_POST"
  //             which:{
  //               in:[
  //                 "FOLLOWING_WRITE_POST",
  //                 "FOLLOWING_WRITE_PETLOG",
  //               ]
  //             },
  //           },
  //           {
  //             publishUser:{
  //               // 차단유저 있는 경우
  //               ...(isBlockUser && {
  //                 id:{
  //                   notIn:blockUserIds,
  //                 },
  //               }),
  //               followers:{
  //                 some:{
  //                   id:loggedInUser.id,
  //                 },
  //               },
  //             },
  //           },
  //         ]
  //       },
  //     ]
  //   },
  //   orderBy:{
  //     // createdAt:"desc"
  //     id: "desc",
  //   },
  //   take,
  //   ...(cursorId && { cursor: { id: cursorId }, skip:1}),
  //   // include 해줘야 받아짐.
  //   include:{
  //     publishUser:{
  //       select:{
  //         id:true,
  //         userName:true,
  //         avatar:true,
  //       },
  //     },
  //   },
  // });

  const notification = await client.notification.findMany({
    where:{
      // subscribeUserId:loggedInUser.id,
      subscribeUserId:logInUserId,
    },
    orderBy:{
      id: "desc",
    },
    take,
    ...(cursorId && { cursor: { id: cursorId }, skip:1}),
  });

  const isNotFetchMore = !cursorId;
  const notificationCount = notification.length;

  // 메세지 받은 개수가 한번에 가져올 갯수랑 달라. 그럼 마지막이라는 뜻. 다만 딱 한번에 가져올 갯수랑 맞아 떨어지면 다음에 가져올 게 없지만 그래도 있는 걸로 나옴.
  const isHaveHaveNextPage = notificationCount === take;

  if( isHaveHaveNextPage ){
    const newCursorId = notification[notificationCount-1].id;
    return {
      cursorId: newCursorId,
      hasNextPage:true,
      notification,
      isNotFetchMore,
    };
  } else {
    return {
      hasNextPage:false,
      notification,
      isNotFetchMore,
    };
  }
}

// cursor 도 만들어야 할듯
const seeUserNotificationListFn:Resolver = async(_,props,ctx) => {
  return paginationErrorCheckNeedLogicAndQueryName(
    await logicSeeUserNotificationList(_,props,ctx,null),
    "seeUserNotificationList"
  );
};

const resolver:Resolvers = {
  // SeeUserNotificationListResponse:{
  //   // 프론트엔드에서 subscription mutation 데이터 받기 위함... 데이터 형식을 프론트엔드에서 못바꿔서..
  //   isNotFetchMore:() => false,
  // },
  Query: {
    seeUserNotificationList:protectResolver(seeUserNotificationListFn),
  },
};

export default resolver;