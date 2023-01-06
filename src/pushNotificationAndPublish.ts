import { PrismaClient } from "@prisma/client";
import { sendSinglePushNotification } from "./fcmAppNotification";
import getNotificationMessage from "./getNotificationMessage";
import pubsub, { NEW_NOTIFICATION } from "./pubsub";


type SongSelectedType = (
  client: PrismaClient,
  whichNotification: string,
  subscribeUserId: number,
  diaryId: number,
) => Promise<void>


export const pushNotificationSongSelected: SongSelectedType = async(client, whichNotification, subscribeUserId, diaryId) => {

  try {
    const notification = await client.notification.create({
      data:{
        which: whichNotification,
        subscribeUserId,
        diaryId,
      },
    });

    const devicePushToken = await client.user.findUnique({
      where:{
        id:subscribeUserId
      },
      select:{
        deviceToken:true,
      },
    });

    // 디바이스 push 알림 전송
    const token = devicePushToken.deviceToken;
    // token null 이면 에러뜸
    if(token){
      const channel = whichNotification;
      const message = getNotificationMessage(whichNotification);
      // FCM 은 string 만 가능
      const paramsObj = { diaryId: diaryId+"" };
      
      sendSinglePushNotification(channel,token,message,paramsObj);
    }
    // subscription 전송
    await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:notification});

  } catch (e) {
    console.log(e);
    console.log("pushNotificationSongSelected // notification, subscription occur error")
  }
};


// loggedInUserId > logInUserId 로?
// export const pushNotificationUpload:UploadType = async(client, loggedInUserId, contentId, contentName) =>{
//   try {
//     // 완료 후 notification 전송 + subscription pubsub 전송
//     const isPost = contentName === "post";
//     const notification = await client.notification.create({
//       data:{
//         which: isPost ? "FOLLOWING_WRITE_POST" : "FOLLOWING_WRITE_PETLOG",
//         publishUser:{
//           connect:{
//             id:loggedInUserId
//           }
//         },
//         ...(isPost ? { postId:contentId } : { petLogId:contentId }),
//       },
//       // include 안하면 안받아짐. 글고 몇개 안쓸 거니까 걔네만 받아
//       include:{
//         publishUser:{
//           // select 랑 include 같이 못씀.
//           select:{
//             id:true,
//             userName:true,
//             avatar:true,
//             followers:{
//               select:{
//                 id:true,
//                 deviceToken:true,
//               }
//             },
//           },
//         },
//       }
//     });
//     // console.log(JSON.stringify(notification));
//     if(notification.publishUser.followers.length !== 0) {
//       // 디바이스 push 알림 전송
//       const tokens = notification.publishUser.followers.map(user=>user.deviceToken);
//       const whichUpload = isPost ? "게시물을" : "펫로그를"
//       const message = `${notification.publishUser.userName}  님이 새로운 ${whichUpload} 업로드 하였습니다.`;
//       const uploadChannel = isPost ? channel.uploadPost : channel.uploadPetLog;
//       sendManyPushNotification(uploadChannel,tokens,message);
//       // subscription 전송
//       await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:notification})
//       // await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:{...notification}})
//     }
//   } catch (e) {
//     console.log(e);
//     console.log("notification, subscription 에서 문제 발생")
//   }
// };




// // whichNotification 목록 (알림 종류)
//   // MY_POST_GET_LIKE                         // 유저의 포스트에 좋아요
//   // MY_POST_GET_COMMENT                      // 유저의 포스트에 댓글
//   // MY_COMMENT_GET_LIKE                      // 유저의 댓글에 좋아요
//   // MY_COMMENT_GET_COMMENT                   // 유저의 댓글에 대댓글
//   // MY_COMMENT_OF_COMMENT_GET_LIKE           // 유저의 대댓글에 좋아요
//   // FOLLOW_ME                                // 유저를 팔로우
//   // "MY_PETLOG_GET_LIKE"                     // 유저의 펫로그에 좋아요
//   // "MY_PETLOG_GET_COMMENT"                  // 유저의 펫로그에 댓글
//   // "MY_PETLOG_COMMENT_GET_LIKE"             // 유저의 펫로그 댓글에 좋아요
//   // "MY_PETLOG_COMMENT_GET_COMMENT"          // 유저의 펫로그 댓글에 댓글
//   // "MY_PETLOG_COMMENT_OF_COMMENT_GET_LIKE"  // 유저의 펫로그 대댓글에 좋아요
//   // 댓글에서 언급 도 만들어야 겠군. 대댓글 단거에 댓글 달린 것도 받는게 나을라나? 여기선 유저 언급한게 나을라나?
//   // 알림이 많을 수록 좋을 듯. 그리고 유저간의 내용으로. 뭐가 있습니다 이런거보다는. 사람들은 새로운 거를 원함. 특히 다른 사람들의.

// type which = "MY_POST_GET_LIKE" | "MY_POST_GET_COMMENT" | "MY_COMMENT_GET_LIKE" | "MY_COMMENT_GET_COMMENT" | "MY_COMMENT_OF_COMMENT_GET_LIKE" | "FOLLOW_ME" | "FOLLOWING_WRITE_PETLOG" | "MY_PETLOG_GET_LIKE" | "MY_PETLOG_GET_COMMENT" | "MY_PETLOG_COMMENT_GET_LIKE" | "MY_PETLOG_COMMENT_GET_COMMENT" | "MY_PETLOG_COMMENT_OF_COMMENT_GET_LIKE";

// type RouteParam = {
//   commentId?: number,
//   commentOfCommentId?: number,
//   userId?: number,
//   userName?: string,
// }

// type PostRouteParam = {
//   // postId?: number,
//   postId?: number,
// } & RouteParam;

// type NotUploadPostType = (
//   client: PrismaClient,
//   whichNotification: which,
//   loggedInUserId: number,
//   subscribeUserId: number,
//   { postId, commentId, commentOfCommentId, userId, userName}: PostRouteParam
// ) => Promise<void>

// // 얘는 Follower 도 포함함. Follower 을 따로 만들어도 좋을듯. 헷갈리니까
// export const pushNotificationNotUploadPost: NotUploadPostType = async(client, whichNotification, loggedInUserId, subscribeUserId, {postId,commentId,commentOfCommentId,userId,userName}) => {

//   try {
//     const notification = await client.notification.create({
//       data:{
//         which: whichNotification,
//         publishUser: {
//           connect: {
//             id:loggedInUserId
//           }
//         },
//         subscribeUserId,
//         ...( postId && { postId } ),
//         ...( commentId && { commentId } ),
//         ...( commentOfCommentId && { commentOfCommentId } ),
//         ...( userId && { userId } ),
//       },
//       //include 해야 유저 정보 pubsub 으로 보낼 수 있음.
//       include: {
//         publishUser: {
//           select: {
//             id:true,
//             userName:true,
//             avatar:true,
//           }
//         }
//       }
//     });

//     const devicePushToken = await client.user.findUnique({
//       where:{
//         id:subscribeUserId
//       },
//       select:{
//         deviceToken:true,
//       },
//     });

//     // 디바이스 push 알림 전송
//     const channel = getChannel(whichNotification);
//     const token = devicePushToken.deviceToken;
//     if(token){
//       const message = `${notification.publishUser.userName} 님이 ${getNotificationMessage(whichNotification)}`;
//       const paramsObj = {
//         ...( postId && { postId: String(postId) } ),
//         ...( commentId && { commentId: String(commentId) } ),
//         ...( commentOfCommentId && { commentOfCommentId: String(commentOfCommentId) } ),
//         ...( userId && { userId: String(userId) } ),
//         ...( userName && { userName }),
//         // ...( roomId && { roomId: String(roomId) }),
//         // ...( sendersUserName && { sendersUserName }),
//         // ...( currentUserId && { currentUserId: String(currentUserId) }),
//       }
      
//       sendSinglePushNotification(channel,token,message,paramsObj);
//     }

//     // subscription 전송
//     await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:notification});
//     // await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:{...notification}})
//   } catch (e) {
//     console.log(e);
//     console.log("notification, subscription 에서 문제 발생")
//   }
// };


// type PetLogRouteParam = {
//   petLogId: number,
// } & RouteParam;

// type NotUploadPetLogType = (
//   client: PrismaClient,
//   whichNotification: which,
//   loggedInUserId: number,
//   subscribeUserId: number,
//   { petLogId, commentId, commentOfCommentId, userId, userName}: PetLogRouteParam
// ) => Promise<void>

// // 걍 commentId,commentOfCommentId 로 써도 될듯?

// export const pushNotificationNotUploadPetLog: NotUploadPetLogType = async(client, whichNotification, loggedInUserId, subscribeUserId, {petLogId,commentId,commentOfCommentId,userId,userName}) => {

//   try {
//     const notification = await client.notification.create({
//       data:{
//         which: whichNotification,
//         publishUser: {
//           connect: {
//             id:loggedInUserId
//           }
//         },
//         subscribeUserId,
//         ...( petLogId && { petLogId } ),
//         ...( commentId && { commentId } ),
//         ...( commentOfCommentId && { commentOfCommentId } ),
//         ...( userId && { userId } ),
//       },
//       //include 해야 유저 정보 pubsub 으로 보낼 수 있음.
//       include: {
//         publishUser: {
//           select: {
//             id:true,
//             userName:true,
//             avatar:true,
//           }
//         }
//       }
//     });

//     const devicePushToken = await client.user.findUnique({
//       where:{
//         id:subscribeUserId
//       },
//       select:{
//         deviceToken:true,
//       },
//     });

//     // 디바이스 push 알림 전송
//     const token = devicePushToken.deviceToken;
//     // token null 이면 에러뜸
//     if(token){
//       const channel = getChannel(whichNotification);
//       const message = `${notification.publishUser.userName} 님이 ${getNotificationMessage(whichNotification)}`;
//       const paramsObj = {
//         ...( petLogId && { petLogId: String(petLogId) } ),
//         ...( commentId && { commentId: String(commentId) } ),
//         ...( commentOfCommentId && { commentOfCommentId: String(commentOfCommentId) } ),
//         ...( userId && { userId: String(userId) } ),
//         ...( userName && { userName }),
//         // ...( roomId && { roomId: String(roomId) }),
//         // ...( sendersUserName && { sendersUserName }),
//         // ...( currentUserId && { currentUserId: String(currentUserId) }),
//       }
      
//       sendSinglePushNotification(channel,token,message,paramsObj);
//     }
//     // subscription 전송
//     await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:notification});
//     // await pubsub.publish(NEW_NOTIFICATION,{userNotificationUpdate:{...notification}})
//   } catch (e) {
//     console.log(e);
//     console.log("notification, subscription 에서 문제 발생")
//   }
// };


