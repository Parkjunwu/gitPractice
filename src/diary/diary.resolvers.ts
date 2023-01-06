// import GraphQLJSON from 'graphql-type-json';
// import { GraphQLScalarType } from "graphql";
// // import { Resolver, Resolvers } from "../types"

// // // // 얜 그냥 받는데에서 include 해서 쓰는게 더 낫지 않을까?
// // // const userFn:Resolver = ({userId},_,{client}) => client.user.findUnique({where:{id:userId}})

// // const likesFn:Resolver = ({id},_,{client}) => client.diariesLike.count({where:{diariesId:id}})

// // const isMineFn:Resolver = ({userId},_,{logInUserId}) => userId === logInUserId

// // const commentNumberFn:Resolver = ({id},_,{client}) => client.diariesComment.count({where:{
// //   diariesId:id
// // }})

// // const isLikedFn: Resolver = async({id},_,{logInUserId,client}) => {
// //   if(!logInUserId) return false;
// //   const ok = await client.diariesLike.findUnique({
// //     where:{
// //       diariesId_userId:{
// //         diariesId:id,
// //         userId:logInUserId,
// //       }
// //     },
// //     select:{
// //       id:true,
// //     }
// //   });
// //   return Boolean(ok);
// // };

// // // 혹시 comment 도 받을거면 user include 까지 같이


// // const resolver: Resolvers = {
// //   // Diaries:{
// //   //   // user:userFn,
// //   //   likes:likesFn,
// //   //   isMine:isMineFn,
// //   //   commentNumber:commentNumberFn,
// //   //   isLiked:isLikedFn,
// //   // },
// // };

// // 지금은 안씀. 굳이 필요 없을듯?
// const resolver: { JSON: GraphQLScalarType<unknown, unknown> } = {
//   JSON: GraphQLJSON,
// };

// export default resolver;
