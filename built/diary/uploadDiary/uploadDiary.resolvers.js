"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCalendarData_1 = __importDefault(require("../../forCalendar/updateCalendarData"));
const AWS_1 = require("../../shared/AWS");
const user_utils_1 = require("../../user/user.utils");
const diary_utils_1 = require("../diary.utils");
const uploadDiaryTypeCheck_1 = require("./uploadDiaryTypeCheck");
// const uploadDiaryFn: Resolver = async(_,{title,fileArr,body,thumbNail,dateTime,youtubeId,requestMusic,}:{title:string,fileArr:Array<any>,body:Array<string>,thumbNail?:any,dateTime:string,youtubeId?:string,requestMusic:boolean,},{client,loggedInUser}) => {
const uploadDiaryFn = async (_, { title, fileArr, body, thumbNailArr, isFirstVideo, dateTime, youtubeId, requestMusic, showDiary, requestMessage, summaryBody, }, { client, logInUserId }) => {
    // console.log("fileArr : "+ JSON.stringify(fileArr))
    // console.log("thumbNailArr : "+ JSON.stringify(thumbNailArr))
    // 얘도 형식 체크 넣어
    // 의뢰를 했는데 youtubeId 가 있으면 에러.
    // 의뢰 메세지도 넣을까?
    // if(requestMusic && youtubeId) {
    if (youtubeId && (requestMusic || showDiary !== undefined || requestMessage)) {
        // console.error(`uploadDiary // requestMusic && youtubeId get together. Hacking possibility`);
        console.error(`uploadDiary // youtubeId && requestMusic related get together. Hacking possibility`);
        return { ok: false, error: "잘못된 형식입니다." };
    }
    if (requestMusic && (showDiary === undefined || (showDiary === false && !requestMessage))) {
        console.error("uploadDiary // requestMusic without showDiary and requestMessage. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    if (!requestMusic && (showDiary !== undefined || requestMessage)) {
        console.error("uploadDiary // requestMusic false with showDiary and requestMessage. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    // // 형식 체크
    const { formError, formErrorType, which,
    // } = uploadDiaryTypeCheck(dateTime,body);
     } = (0, uploadDiaryTypeCheck_1.uploadDiaryTypeCheck)(dateTime, summaryBody);
    if (formError) {
        // if(formErrorType === "wrongApproach") {
        //   return returnErrorWrongApproach(which);
        // } else if(formErrorType === "getFuture") {
        //   return returnErrorGetFuture(which);
        // } else if(formErrorType === "getTooPast") {
        //   return returnErrorGetTooPast();
        // }
        return (0, uploadDiaryTypeCheck_1.returnMatchedErrorAndConsoleError)(formErrorType, which);
    }
    // 추가 비디오 갯수랑 썸넬 갯수 비교. 근데 그러면 여기서 await 해서 받아야되네. 흠. 일단 얘는 나중에. thumbNailArr 가 필수가 아니니까 length === 0 이면 return 하는 것도 넣거나 필수로 만들던지.
    // isFirstVideo 넣어서 isFirstVideo true 인데 fileArr 없거나 thumbNailArr 없는 경우도
    const noFileArr = fileArr.length === 0;
    const noThumbNail = !thumbNailArr || thumbNailArr.length === 0;
    if ((noFileArr && !noThumbNail)) {
        console.error("uploadDiary // get thumbNailArr without fileArr. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    if (isFirstVideo && noFileArr) {
        console.error("uploadDiary // get isFirstVideo true without fileArr. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    if (isFirstVideo && noThumbNail) {
        console.error("uploadDiary // get isFirstVideo true without thumbNailArr. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    // 지금은 이미지만 쓸거라서 이거 넣음
    if (fileArr.some(file => file.file?.mimetype !== "image/jpeg")) {
        console.error("uploadDiary // fileArr get something not image. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    if (fileArr.length > 10) {
        return { ok: false, error: "10장 이상의 사진을 업로드 하실 수 없습니다." };
    }
    // const userId = loggedInUser.id;
    const userId = logInUserId;
    // 업로드할 url 배열
    let addFileUrlArr;
    // let thumbNailUrl:string|undefined;
    let addThumbNailUrlArr;
    try {
        const dateForUnique = Date.now();
        //aws 업로드. url 받은 거 데이터베이스에도 씀. await Promise.all , map 같이 써야하는거 유의
        addFileUrlArr = await Promise.all(fileArr.map(async (file) => {
            // if(loggedInUser?.id){ // 이걸 왜 체크한거지?
            const url = await (0, AWS_1.async_uploadPhotoS3)(file, userId, dateForUnique, AWS_1.S3_FOLDER_NAME);
            return url;
            // }
        }));
        // if(thumbNail){
        //   thumbNailUrl = await async_uploadPhotoS3(thumbNail,userId,S3_FOLDER_NAME);
        // }
        if (thumbNailArr) {
            addThumbNailUrlArr = await Promise.all(thumbNailArr.map(async (file) => {
                const url = await (0, AWS_1.async_uploadThumbNailS3)(file, userId, dateForUnique);
                return url;
            }));
        }
    }
    catch (e) {
        console.log("uploadDiary // error : " + e);
        return { ok: false, error: "파일 업로드에 실패하였습니다." };
    }
    const thumbNail = isFirstVideo ? addThumbNailUrlArr[0] : addFileUrlArr[0]; // 없으면 undefined 일듯? addFileUrlArr 가 어쨋든 [] 라도 있으니까.
    const result = await client.diary.create({
        data: {
            user: {
                connect: {
                    id: userId
                },
            },
            title,
            file: addFileUrlArr,
            body,
            dateTime: Number(dateTime),
            // ...(thumbNailUrl && { thumbNail: thumbNailUrl }),
            ...(thumbNail && { thumbNail }),
            ...(youtubeId && { youtubeId }),
            ...(summaryBody && { summaryBody }),
        },
        // 굳이 다 받을 필요 없으니 얘를 써도 됨. 나머지는 프론트엔드에서 캐시로 구현. 귀찮으면 그냥 전체 다 받음.
        select: {
            id: true,
            createdAt: true,
            // title:true,
            // body:true,
        },
    });
    // 의뢰시 Administrator 한테 메일
    // 얘가 요청 실패하면 결과를 false 로 해야할라나? 글고 await 붙여야 되는데 일단 안쓰고 걍 넣음
    if (requestMusic) {
        const { id } = result;
        (0, diary_utils_1.sendRequestEmailToAdminister)({
            diaryId: id,
            queryName: "uploadDiary",
            ...(showDiary && {
                diaryTitle: title,
                body,
            }),
            requestMessage,
        });
    }
    const logInUser = await client.user.findUnique({
        where: {
            id: logInUserId,
        },
        select: {
            totalDiary: true,
            ...(youtubeId && { ytIdArr: true }),
        },
    });
    // ytIdArr 에도 없으면 추가. diary.utils getAndSetUserYtIdArr 랑 로직 비슷함.
    let ytIdArr = undefined;
    if (youtubeId) {
        // null 일 때도 잘 됨.
        // const prevYtIdArr = loggedInUser.ytIdArr as Prisma.JsonArray;
        const prevYtIdArr = logInUser.ytIdArr;
        if (prevYtIdArr) {
            if (!prevYtIdArr.includes(youtubeId)) {
                ytIdArr = [...prevYtIdArr, youtubeId];
            }
        }
        else {
            ytIdArr = [youtubeId];
        }
    }
    // console.log("JSON.stringify(ytIdArr) : "+JSON.stringify(ytIdArr))
    // totalDiary 변경
    // const prevTotalDiary = loggedInUser.totalDiary;
    const prevTotalDiary = logInUser.totalDiary;
    await client.user.update({
        where: {
            id: userId,
        },
        data: {
            totalDiary: prevTotalDiary + 1,
            ...(ytIdArr && { ytIdArr }),
        },
        select: {
            id: true,
        },
    });
    // 캘린더용 데이터 업데이트
    // type convertedMonthType = "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "m7" | "m8" | "m9" | "m10" | "m11" | "m12";
    // const convertedMonth = "m"+createdMonth;
    // const isNowOrOnTableYear = createdYear === nowYear || prevYearsOnDataBaseList.includes(createdYear);
    // const tableName = isNowOrOnTableYear ? "y"+ dateTime.substring(2,4) : "beforeY22";
    // // 로직임. 실행은 밑에 있음. 따로 빼도 되는데 빼면 보기 어려울듯? 뺄라면 result,convertedMonth,stringCreatedYear 도 받아야함.
    // // 주석은 얘가 tableName 지정 안해서 타입이 안나와서 볼라고 넣은거. y22 의 m1 기준.
    // // const updateForCalendarData = async(tableName:"y22"|"y23"|"beforeY22") => {
    // const updateForCalendarData = async(tableName:string) => {
    //   // const prevDiaryListData = await client.y22.findUnique({
    //   const prevDiaryListData = await client[tableName].findUnique({
    //     where:{
    //       userId:userId,
    //     },
    //     select:{
    //       // m1:true,
    //       [convertedMonth]:true,
    //     },
    //   });
    //   const addDiaryData = {
    //     date:createdDate,
    //     id:result.id,
    //     title,
    //   };
    //   let updatedDiaryListData: Prisma.JsonArray;
    //   if(tableName === "beforeY22") {
    //     // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
    //     const checkIsDataAndIfExistReturnYearIndex = prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth]) && prevDiaryListData[convertedMonth].findIndex((yearObject:Prisma.JsonObject)=>Boolean(yearObject[createdYear]));
    //     // yearObject[createdYear] 있으면 true 없으면 false? ex) yearObject.2014 없으면 undefined
    //     // null/undefined 아니고 -1 아냐(해당 year 가 존재한다)
    //     // const checkRight = typeof checkIsDataAndIfExistReturnYearIndex === "number" && checkIsDataAndIfExistReturnYearIndex !== -1;
    //     const checkIsDataNotNull = typeof checkIsDataAndIfExistReturnYearIndex === "number";
    //     const isCreatedYearAlreadyExist = checkIsDataAndIfExistReturnYearIndex !== -1;
    //     if (checkIsDataNotNull) {
    //       updatedDiaryListData = prevDiaryListData[convertedMonth];
    //       if(isCreatedYearAlreadyExist) {
    //         // 변수명 깔끔하게 변경
    //         const yearIndex = checkIsDataAndIfExistReturnYearIndex;
    //         updatedDiaryListData[yearIndex][createdYear].push(addDiaryData);
    //       } else {
    //         const addYearData = {[createdYear] : [addDiaryData]};
    //         updatedDiaryListData.push(addYearData);
    //       }
    //     } else {
    //       updatedDiaryListData = [ {[createdYear] : [addDiaryData]} ];
    //     }
    //   } else {
    //     // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
    //     // if (prevDiaryListData?.m1 && Array.isArray(prevDiaryListData?.m1)) {
    //     //   updatedDiaryListData = [ ...prevDiaryListData.m1, addDiaryData ];
    //     if (prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth])) {
    //       updatedDiaryListData = [ ...prevDiaryListData[convertedMonth], addDiaryData ];
    //     } else {
    //       updatedDiaryListData = [ addDiaryData ];
    //     }
    //   }
    //   // update 말고 create 도 있어야함. 없는 경우 생성해야돼.
    //   const dataLogic = (workType:"create" | "update") => ({
    //     data:{
    //       // m1:updatedDiaryListData,
    //       [convertedMonth]:updatedDiaryListData,
    //       ...(workType === "create" && {
    //         user:{
    //           connect:{
    //             id:userId,
    //           },
    //         },
    //       }),
    //     },
    //     select:{
    //       id:true,
    //     },
    //   });
    //   if(!prevDiaryListData) {
    //     // await client.y22.create({
    //     await client[tableName].create({
    //       ...dataLogic("create"),
    //     });
    //   } else {
    //     // await client.y22.update({
    //     await client[tableName].update({
    //       where:{
    //         userId:userId,
    //       },
    //       ...dataLogic("update"),
    //     });
    //   }
    // };
    // // tableName ("y22", "y23", "beforeY22" 등) 넣어서 실행.
    // await updateForCalendarData(tableName);
    const workTypeAndNeededData = {
        uploadDiary: {
            // createdDate:dateTime,
            id: result.id,
            title,
            summaryBody: summaryBody ?? null,
        }
    };
    await (0, updateCalendarData_1.default)(workTypeAndNeededData, +dateTime, userId);
    // 지금은 upload 해도 알림 보낼 사람이 없음. 나중에 생기면 넣어
    // const diaryId = result.id;
    // 완료 후 notification 전송 + subscription pubsub 전송
    // await pushNotificationUpload(client, userId, diaryId, "diary");
    return { ok: true, uploadedDiary: result };
    // return { ok:true };
};
const resolver = {
    Mutation: {
        uploadDiary: (0, user_utils_1.protectResolver)(uploadDiaryFn),
    },
};
exports.default = resolver;
// // 동영상 하나로 바꾼 후
// import { Prisma } from "@prisma/client";
// import updateCalendarData from "../../forCalendar/updateCalendarData";
// import { async_uploadPhotoS3, async_uploadThumbNailS3, S3_FOLDER_NAME } from "../../shared/AWS";
// import { Resolver, Resolvers } from "../../types";
// import { protectResolver } from "../../user/user.utils";
// import { sendRequestEmailToAdminister } from "../diary.utils";
// import { uploadDiaryTypeCheck, returnMatchedErrorAndConsoleError } from "./uploadDiaryTypeCheck";
// // const uploadDiaryFn: Resolver = async(_,{title,fileArr,body,thumbNail,dateTime,youtubeId,requestMusic,}:{title:string,fileArr:Array<any>,body:Array<string>,thumbNail?:any,dateTime:string,youtubeId?:string,requestMusic:boolean,},{client,loggedInUser}) => {
// const uploadDiaryFn: Resolver = async(_,{title,fileArr,videoFile,videoIndex,videoThumbNail,body,dateTime,youtubeId,requestMusic,summaryBody,}:{title:string,fileArr:Array<any>,videoFile:any,videoIndex:number,videoThumbNail?:any,body:Array<string>,dateTime:string,youtubeId?:string,requestMusic:boolean,summaryBody?:string},{client,logInUserId}) => {
//   // console.log("fileArr : "+ JSON.stringify(fileArr))
//   // console.log("mimetype : "+ JSON.stringify(fileArr.map(file=>file.file?.mimetype)))
//   // console.log("thumbNailArr : "+ JSON.stringify(thumbNailArr))
//   // 얘도 형식 체크 넣어
//   // 의뢰를 했는데 youtubeId 가 있으면 에러.
//   // 의뢰 메세지도 넣을까?
//   if(requestMusic && youtubeId) {
//     console.error(`uploadDiary // requestMusic && youtubeId get together. Hacking possibility`);
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   // // 형식 체크
//   const {
//     formError,
//     formErrorType,
//     which,
//   // } = uploadDiaryTypeCheck(dateTime,body);
//   } = uploadDiaryTypeCheck(dateTime,summaryBody);
//   if(formError) {
//     // if(formErrorType === "wrongApproach") {
//     //   return returnErrorWrongApproach(which);
//     // } else if(formErrorType === "getFuture") {
//     //   return returnErrorGetFuture(which);
//     // } else if(formErrorType === "getTooPast") {
//     //   return returnErrorGetTooPast();
//     // }
//     return returnMatchedErrorAndConsoleError(formErrorType,which);
//   }
//   // 추가 비디오 갯수랑 썸넬 갯수 비교. 근데 그러면 여기서 await 해서 받아야되네. 흠. 일단 얘는 나중에. thumbNailArr 가 필수가 아니니까 length === 0 이면 return 하는 것도 넣거나 필수로 만들던지.
//   // 비디오 하나만 쓰면서 필요 없어짐. 나중에 필요하면 다시 넣어
//   // isFirstVideo 넣어서 isFirstVideo true 인데 fileArr 없거나 thumbNailArr 없는 경우도
//   // const noFileArr = fileArr.length === 0;
//   // const noThumbNail = !thumbNailArr || thumbNailArr.length === 0;
//   // if((noFileArr && !noThumbNail)) {
//   //   console.error("uploadDiary // get thumbNailArr without fileArr. Hacking possibility.");
//   //   return { ok:false, error:"잘못된 형식입니다." };
//   // }
//   // if(isFirstVideo && noFileArr) {
//   //   console.error("uploadDiary // get isFirstVideo true without fileArr. Hacking possibility.");
//   //   return { ok:false, error:"잘못된 형식입니다." };
//   // }
//   // if(isFirstVideo && noThumbNail) {
//   //   console.error("uploadDiary // get isFirstVideo true without thumbNailArr. Hacking possibility.");
//   //   return { ok:false, error:"잘못된 형식입니다." };
//   // }
//   //// 비디오 추가 ////
//   if(fileArr.some(file=>file.file?.mimetype !== "image/jpeg")) {
//     console.error("uploadDiary // fileArr get something not image. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   // videoThumbNail videoIndex videoFile 다 있거나 다 없거나 아니면 return
//   // undefined < 0 도 false 임.
//   if (!((videoThumbNail && videoIndex > -1 && videoFile && videoFile.file?.mimetype === "video/mp4" && videoThumbNail.file?.mimetype === "image/jpeg") || (!videoThumbNail && videoIndex === undefined && !videoFile))) {
//     console.error("uploadDiary // invalid video type. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   if(videoIndex !== undefined && fileArr.length < videoIndex) {
//     console.error("uploadDiary // videoIndex is bigger than fileArr.length. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   //// 여기까지 비디오 추가 ////
//   // const userId = loggedInUser.id;
//   const userId = logInUserId;
//   // 업로드할 url 배열
//   let addFileUrlArr:Array<string>;
//   let videoThumbNailUrl:string|undefined;
//   // let addThumbNailUrlArr:Array<string>;
//   const dateForUnique = Date.now();
//   try {
//     //aws 업로드. url 받은 거 데이터베이스에도 씀. await Promise.all , map 같이 써야하는거 유의
//     addFileUrlArr = await Promise.all(
//       fileArr.map(async (file:any) => {
//         // if(loggedInUser?.id){ // 이걸 왜 체크한거지?
//           const url = await async_uploadPhotoS3(file,userId,dateForUnique,S3_FOLDER_NAME);
//           return url;
//         // }
//       })
//     );
//     // 비디오 하나만 쓰면서 필요 없어짐. 나중에 필요하면 다시 넣어
//     // if(thumbNailArr){
//     //   addThumbNailUrlArr = await Promise.all(
//     //     thumbNailArr.map(async (file:any) => {
//     //       const url = await async_uploadThumbNailS3(file,userId,dateForUnique);
//     //       return url;
//     //     })
//     //   );
//     // }
//     //// 비디오 추가 ////
//     if(videoThumbNail){
//       videoThumbNailUrl = await async_uploadThumbNailS3(videoThumbNail,userId,dateForUnique);
//     }
//     if(videoFile) {
//       const videoUrl = await async_uploadPhotoS3(videoFile,userId,dateForUnique,S3_FOLDER_NAME);
//       addFileUrlArr ?
//         addFileUrlArr.splice(videoIndex,0,videoUrl)
//       :
//         addFileUrlArr = [videoUrl];
//     }
//     //// 여기까지 비디오 추가 ////
//   } catch (e) {
//     console.log("uploadDiary // error : " + e);
//     return { ok:false, error:"파일 업로드에 실패하였습니다." };
//   }
//   // const thumbNail = isFirstVideo ? addThumbNailUrlArr[0] : addFileUrlArr[0]; // 없으면 undefined 일듯? addFileUrlArr 가 어쨋든 [] 라도 있으니까.
//   const thumbNail = videoIndex === 0 ? videoThumbNailUrl : addFileUrlArr[0];
//   const result = await client.diary.create({
//     data:{
//       user:{
//         connect:{
//           id:userId
//         },
//       },
//       title,
//       file: addFileUrlArr,
//       body,
//       dateTime: Number(dateTime),
//       ...(thumbNail && { thumbNail }),
//       ...(youtubeId && { youtubeId }),
//       ...(summaryBody && { summaryBody }),
//     },
//     // 굳이 다 받을 필요 없으니 얘를 써도 됨. 나머지는 프론트엔드에서 캐시로 구현. 귀찮으면 그냥 전체 다 받음.
//     select:{
//       id:true,
//       createdAt:true,
//       title:true,
//       body:true,
//     },
//   });
//   // 의뢰시 Administrator 한테 메일
//   // 얘가 요청 실패하면 결과를 false 로 해야할라나? 글고 await 붙여야 되는데 일단 안쓰고 걍 넣음
//   if(requestMusic) {
//     const {
//       id,
//       title,
//       body
//     } = result;
//     sendRequestEmailToAdminister(id,"uploadDiary",title,body);
//   }
//   const logInUser = await client.user.findUnique({
//     where:{
//       id:logInUserId,
//     },
//     select:{
//       totalDiary:true,
//       ...(youtubeId && { ytIdArr:true } ),
//     },
//   });
//   // ytIdArr 에도 없으면 추가. diary.utils getAndSetUserYtIdArr 랑 로직 비슷함.
//   let ytIdArr = undefined;
//   if(youtubeId){
//     // null 일 때도 잘 됨.
//     // const prevYtIdArr = loggedInUser.ytIdArr as Prisma.JsonArray;
//     const prevYtIdArr = logInUser.ytIdArr as Prisma.JsonArray;
//     if(prevYtIdArr) {
//       if(!prevYtIdArr.includes(youtubeId)) {
//         ytIdArr = [...prevYtIdArr,youtubeId];
//       }
//     } else {
//       ytIdArr = [youtubeId];
//     }
//   }
//   // console.log("JSON.stringify(ytIdArr) : "+JSON.stringify(ytIdArr))
//   // totalDiary 변경
//   // const prevTotalDiary = loggedInUser.totalDiary;
//   const prevTotalDiary = logInUser.totalDiary;
//   await client.user.update({
//     where:{
//       id:userId,
//     },
//     data:{
//       totalDiary:prevTotalDiary+1,
//       ...( ytIdArr && { ytIdArr } ),
//     },
//     select:{
//       id:true,
//     },
//   });
//   // 캘린더용 데이터 업데이트
//   // type convertedMonthType = "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "m7" | "m8" | "m9" | "m10" | "m11" | "m12";
//   // const convertedMonth = "m"+createdMonth;
//   // const isNowOrOnTableYear = createdYear === nowYear || prevYearsOnDataBaseList.includes(createdYear);
//   // const tableName = isNowOrOnTableYear ? "y"+ dateTime.substring(2,4) : "beforeY22";
//   // // 로직임. 실행은 밑에 있음. 따로 빼도 되는데 빼면 보기 어려울듯? 뺄라면 result,convertedMonth,stringCreatedYear 도 받아야함.
//   // // 주석은 얘가 tableName 지정 안해서 타입이 안나와서 볼라고 넣은거. y22 의 m1 기준.
//   // // const updateForCalendarData = async(tableName:"y22"|"y23"|"beforeY22") => {
//   // const updateForCalendarData = async(tableName:string) => {
//   //   // const prevDiaryListData = await client.y22.findUnique({
//   //   const prevDiaryListData = await client[tableName].findUnique({
//   //     where:{
//   //       userId:userId,
//   //     },
//   //     select:{
//   //       // m1:true,
//   //       [convertedMonth]:true,
//   //     },
//   //   });
//   //   const addDiaryData = {
//   //     date:createdDate,
//   //     id:result.id,
//   //     title,
//   //   };
//   //   let updatedDiaryListData: Prisma.JsonArray;
//   //   if(tableName === "beforeY22") {
//   //     // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
//   //     const checkIsDataAndIfExistReturnYearIndex = prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth]) && prevDiaryListData[convertedMonth].findIndex((yearObject:Prisma.JsonObject)=>Boolean(yearObject[createdYear]));
//   //     // yearObject[createdYear] 있으면 true 없으면 false? ex) yearObject.2014 없으면 undefined
//   //     // null/undefined 아니고 -1 아냐(해당 year 가 존재한다)
//   //     // const checkRight = typeof checkIsDataAndIfExistReturnYearIndex === "number" && checkIsDataAndIfExistReturnYearIndex !== -1;
//   //     const checkIsDataNotNull = typeof checkIsDataAndIfExistReturnYearIndex === "number";
//   //     const isCreatedYearAlreadyExist = checkIsDataAndIfExistReturnYearIndex !== -1;
//   //     if (checkIsDataNotNull) {
//   //       updatedDiaryListData = prevDiaryListData[convertedMonth];
//   //       if(isCreatedYearAlreadyExist) {
//   //         // 변수명 깔끔하게 변경
//   //         const yearIndex = checkIsDataAndIfExistReturnYearIndex;
//   //         updatedDiaryListData[yearIndex][createdYear].push(addDiaryData);
//   //       } else {
//   //         const addYearData = {[createdYear] : [addDiaryData]};
//   //         updatedDiaryListData.push(addYearData);
//   //       }
//   //     } else {
//   //       updatedDiaryListData = [ {[createdYear] : [addDiaryData]} ];
//   //     }
//   //   } else {
//   //     // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
//   //     // if (prevDiaryListData?.m1 && Array.isArray(prevDiaryListData?.m1)) {
//   //     //   updatedDiaryListData = [ ...prevDiaryListData.m1, addDiaryData ];
//   //     if (prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth])) {
//   //       updatedDiaryListData = [ ...prevDiaryListData[convertedMonth], addDiaryData ];
//   //     } else {
//   //       updatedDiaryListData = [ addDiaryData ];
//   //     }
//   //   }
//   //   // update 말고 create 도 있어야함. 없는 경우 생성해야돼.
//   //   const dataLogic = (workType:"create" | "update") => ({
//   //     data:{
//   //       // m1:updatedDiaryListData,
//   //       [convertedMonth]:updatedDiaryListData,
//   //       ...(workType === "create" && {
//   //         user:{
//   //           connect:{
//   //             id:userId,
//   //           },
//   //         },
//   //       }),
//   //     },
//   //     select:{
//   //       id:true,
//   //     },
//   //   });
//   //   if(!prevDiaryListData) {
//   //     // await client.y22.create({
//   //     await client[tableName].create({
//   //       ...dataLogic("create"),
//   //     });
//   //   } else {
//   //     // await client.y22.update({
//   //     await client[tableName].update({
//   //       where:{
//   //         userId:userId,
//   //       },
//   //       ...dataLogic("update"),
//   //     });
//   //   }
//   // };
//   // // tableName ("y22", "y23", "beforeY22" 등) 넣어서 실행.
//   // await updateForCalendarData(tableName);
//   const workTypeAndNeededData = {
//     uploadDiary:{
//       // createdDate:dateTime,
//       id:result.id,
//       title,
//       summaryBody:summaryBody ?? null,
//     }
//   };
//   await updateCalendarData(workTypeAndNeededData,+dateTime,userId);
//   // 지금은 upload 해도 알림 보낼 사람이 없음. 나중에 생기면 넣어
//   // const diaryId = result.id;
//   // 완료 후 notification 전송 + subscription pubsub 전송
//   // await pushNotificationUpload(client, userId, diaryId, "diary");
//   return { ok:true, uploadedDiary:result };
//   // return { ok:true };
// };
// const resolver:Resolvers = {
//   Mutation: {
//     uploadDiary: protectResolver(uploadDiaryFn),
//   },
// };
// export default resolver;
