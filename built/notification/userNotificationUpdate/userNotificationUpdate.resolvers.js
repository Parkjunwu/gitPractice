"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_subscriptions_1 = require("graphql-subscriptions");
const pubsub_1 = __importStar(require("../../pubsub"));
// const subscribeFn = 
const resolver = {
    Subscription: {
        userNotificationUpdate: {
            subscribe: 
            // ()=>pubsub.asyncIterator(NEW_MESSAGE)
            async (parent, args, context, info) => {
                // context.loggedInUser.id
                // if(!context.loggedInUser.id) {
                if (typeof context.logInUserId !== "number") {
                    throw new Error("Cannot see this.");
                }
                return (0, graphql_subscriptions_1.withFilter)(() => pubsub_1.default.asyncIterator(pubsub_1.NEW_NOTIFICATION), 
                // async({userNotificationUpdate},_,{loggedInUser}) => {
                async ({ userNotificationUpdate }, _, { logInUserId }) => {
                    // const whichNotification = userNotificationUpdate.which;
                    // const isUploadNoti = whichNotification === "FOLLOWING_WRITE_POST" || whichNotification === "FOLLOWING_WRITE_PETLOG";
                    // if(isUploadNoti) {
                    //   // 이건 follower 받고 그걸로 확인. 데이터베이스 한번만 들어가지만 보내는 사람 팔로워가 커지면 데이터 양이 커짐. 이게 서버로 가서 확인된 유저에게 보내는 건지. 이러면 이게 짱이지만 메커니즘을 정확히 몰라서 좋을 지는 잘 모르겟음.
                    //   const array = userNotificationUpdate.publishUser.followers;
                    //   const id = loggedInUser.id;
                    //   for(let i in array) {
                    //     if(array[i].id === id) {
                    //       return true;
                    //     }
                    //   }
                    //   return false;
                    //   //얘는 follower 안받고 보낸 유저 id 가 내 팔로워에 있나로 확인. post 업로드 마다 모든 유저가 데이터베이스로 확인해야함. 이게 더 안좋겟군.
                    //   // console.log(userNotificationUpdate.publishUser.followers.include({id:loggedInUser.id}));
                    //   // return userNotificationUpdate.publishUser.followers.include({id:loggedInUser.id})
                    //   // const ok = await client.user.findFirst({
                    //   //     where:{
                    //   //       id:loggedInUser.id,
                    //   //       following:{
                    //   //         some:{
                    //   //           id:userNotificationUpdate.publishUserId
                    //   //         }
                    //   //       }
                    //   //     },
                    //   //     select:{
                    //   //       id:true
                    //   //     }
                    //   //   });
                    //   //   // console.log(ok)
                    //   // return Boolean(ok);
                    // } else {
                    // return userNotificationUpdate.subscribeUserId === loggedInUser.id;
                    return userNotificationUpdate.subscribeUserId === logInUserId;
                    // }
                })(parent, args, context, info);
            },
        },
    },
};
exports.default = resolver;
