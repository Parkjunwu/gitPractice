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
                    //   // ?????? follower ?????? ????????? ??????. ?????????????????? ????????? ??????????????? ????????? ?????? ???????????? ????????? ????????? ?????? ??????. ?????? ????????? ?????? ????????? ???????????? ????????? ??????. ????????? ?????? ???????????? ??????????????? ????????? ????????? ?????? ?????? ??? ????????????.
                    //   const array = userNotificationUpdate.publishUser.followers;
                    //   const id = loggedInUser.id;
                    //   for(let i in array) {
                    //     if(array[i].id === id) {
                    //       return true;
                    //     }
                    //   }
                    //   return false;
                    //   //?????? follower ????????? ?????? ?????? id ??? ??? ???????????? ????????? ??????. post ????????? ?????? ?????? ????????? ????????????????????? ???????????????. ?????? ??? ????????????.
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
