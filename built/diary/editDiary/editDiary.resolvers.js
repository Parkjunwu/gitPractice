"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCalendarData_1 = __importDefault(require("../../forCalendar/updateCalendarData"));
const AWS_1 = require("../../shared/AWS");
const user_utils_1 = require("../../user/user.utils");
const diary_utils_1 = require("../diary.utils");
// import { checkJsonIsStringArrayNumberArray } from "../editDiary/editDiaryTypeCheck";
// dateTime 도 변경하게 만들건지.
// const editDiaryFn: Resolver = async(_, {id, title, body, addFileArr, addFileIndexArr, deleteFileArr, wholeFileArr, thumbNail, deletePrevThumbNail, youtubeId,}:{id:number, title?:string, body?:Array<string>, addFileArr?:Array<any>, addFileIndexArr?:Array<number>, deleteFileArr?:Array<string>, wholeFileArr?:Array<string>, thumbNail?:any, deletePrevThumbNail?:boolean, youtubeId:string | null | undefined, }, {client, logInUserId}) => {
// const jsonCheckList = {
//   string: { body, deleteFileArr, wholeFileArr },
//   number: { addFileIndexArr },
// };
// const { formError, which } = checkJsonIsStringArrayNumberArray(jsonCheckList);
// if(formError) {
//   console.error(`editDiary // returnErrorWrongApproach // ${which}이 이상하게 들어옴. Hacking suspected`);
//   return { ok:false, error:"잘못된 형식입니다." };
// }
const editDiaryFn = async (_, { id, title, body, changeThumbNail, addFileArr, addFileIndexArr, addThumbNailArr, deleteFileArr, wholeFileArr, youtubeId, summaryBody, }, { client, logInUserId }) => {
    const oldDiary = await client.diary.findFirst({
        where: {
            id,
            // userId:loggedInUser.id,
            userId: logInUserId,
        },
        select: {
            // id:true,
            thumbNail: true,
        },
    });
    if (!oldDiary) {
        console.error("editDiary // try to change not exist / another user's diary. Hacking suspected");
        return { ok: false, error: "존재하지 않는 일기입니다." };
    }
    // 일단 받은 배열 wholeFileArr 에 결과를 집어넣음
    if (wholeFileArr?.length > 10) {
        return { ok: false, error: "10장 이상의 사진을 업로드 하실 수 없습니다." };
    }
    if (wholeFileArr && !addFileArr && !addFileIndexArr && !deleteFileArr) {
        // wholeFileArr 가 왔는데 addFileArr, addFileIndexArr, deleteFileArr 가 같이 안오면 에러. 이상한 접근.
        console.log("editDiary // wholeFileArr doesn't get with addFileArr, addFileIndexArr");
        return { ok: false, error: "알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
    }
    if (addFileArr?.length !== addFileIndexArr?.length) {
        // addFileArr, addFileIndexArr 하나만 왔거나 addFileArr, addFileIndexArr length 가 안맞으면 이상한 접근.
        console.log("editDiary // get either addFileArr, addFileIndexArr or addFileArr, addFileIndexArr length is not same.");
        return { ok: false, error: "알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
    }
    // length === 0 이면 return 할까? wholeFileArr 빼고
    // const isEmptyAddFileArr = addFileArr ? addFileArr.length === 0 : false;
    // 여기도 addFileIndexArr addThumbNailArr 확인
    const noWholeFile = !wholeFileArr || wholeFileArr.length === 0;
    const noAddThumbNail = !addThumbNailArr || addThumbNailArr.length === 0;
    if ((noWholeFile && !noAddThumbNail)) {
        console.error("editDiary // get addThumbNailArr without wholeFileArr. Hacking suspected.");
        return { ok: false, error: "알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
    }
    if (summaryBody && summaryBody.length > 40) {
        console.error("editDiary // summaryBody get more than 40. Hacking suspected");
        return { ok: false, error: "알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
    }
    // 날림
    // if(deletePrevThumbNail) {
    //   const prevThumbNail = oldDiary.thumbNail;
    //   if(prevThumbNail === null) {
    //     console.error("썸넬을 지우라고 했는데 썸넬이 없음. Hacking suspected")
    //     return {ok:false,error:"이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
    //   }
    //   try {
    //     await async_deletePhotoS3(prevThumbNail,S3_FOLDER_NAME)
    //   } catch (e) {
    //     return {ok:false, error:"Delete file Error"}
    //   }
    // }
    // 지금은 이미지만 쓸거라서 이거 넣음
    if (addFileArr?.some(file => file.file?.mimetype !== "image/jpeg")) {
        console.error("editDiary // addFileArr get something not image. Hacking possibility.");
        return { ok: false, error: "잘못된 형식입니다." };
    }
    // deleteFileArr, wholeFileArr 왔을 때 검증. 이전 사진 목록과 대조.
    if (deleteFileArr || wholeFileArr) {
        // 이전 사진 목록
        const prevDiary = await client.diary.findUnique({
            where: {
                id
            },
            select: {
                file: true,
            },
        });
        const prevJsonFileArr = prevDiary.file;
        let prevFileArr = [];
        if (prevJsonFileArr && typeof prevJsonFileArr === 'object' && Array.isArray(prevJsonFileArr)) {
            prevFileArr = prevJsonFileArr;
        }
        // 전체 목록이 이전에 있는 목록이랑 다른지. 그것도 확인
        if (wholeFileArr) {
            try {
                wholeFileArr.map((url) => {
                    // 추가할 곳은 넘어감
                    if (url === "")
                        return;
                    const isInPrevFile = prevFileArr.includes(url);
                    // 없으면 에러 메세지 출력하고 에러 메세지 전송.
                    if (!isInPrevFile) {
                        throw Error("editDiary // wholeFileArr has file which is not on prevFileArr. Hacking suspected.");
                    }
                });
            }
            catch (e) {
                console.log(e);
                return { ok: false, error: "이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
            }
        }
        if (deleteFileArr) {
            // 여기서 하나라도 다른게 있으면 아예 삭제를 안하거나, 아니면 있는 애들은 지우고 없는 거만 오류 출력하거나.
            // 캐시를 쓰면 실제 데이터와 로컬 데이터가 달라질 수 있어서 문제가 있을 거 같긴 한데, 그래도 아예 안하게 하는게 낫겠지?
            try {
                deleteFileArr.map((url) => {
                    const isInPrevFile = prevFileArr.includes(url);
                    // 없으면 에러 메세지 출력하고 에러 메세지 전송.
                    if (!isInPrevFile) {
                        throw Error("editDiary // deleteFileArr has file which is not on prevFileArr. Hacking suspected.");
                    }
                });
            }
            catch (e) {
                console.log(e);
                return { ok: false, error: "이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
            }
            // S3 삭제
            try {
                await Promise.all(deleteFileArr.map((async (deleteFileUrl) => {
                    // await async_deletePhotoS3(deleteFileUrl,S3_FOLDER_NAME);
                    await (0, AWS_1.async_deletePhotoS3)(deleteFileUrl);
                })));
            }
            catch (e) {
                return { ok: false, error: "Delete file Error" };
            }
        }
    }
    const dateForUnique = Date.now();
    if (addFileArr) {
        try {
            await Promise.all(addFileArr.map(async (fileObj, index) => {
                const url = await (0, AWS_1.async_uploadPhotoS3)(fileObj, logInUserId, dateForUnique, AWS_1.S3_FOLDER_NAME);
                wholeFileArr[addFileIndexArr[index]] = url;
            }));
        }
        catch (e) {
            return returnUploadFailNeedWhichAndError("image/video", e);
        }
    }
    //  근데 만약 사진은 지웠는데 올리는데서 오류났어, 그러면 다시 복구하는 코드도 작성해야 하지 않나??
    // 날림
    // let deleteThumbNailFieldData;
    // let gettingThumbNail;
    // if(thumbNail) {
    //   try {
    //     // gettingThumbNail = await async_uploadPhotoS3(thumbNail, loggedInUser.id, S3_FOLDER_NAME);
    //     gettingThumbNail = await async_uploadPhotoS3(thumbNail, logInUserId, S3_FOLDER_NAME);
    //   } catch (e) {
    //     console.log(e);
    //     console.log("editDiary // S3 사진 업로드 오류");
    //     return {ok:false, error:"업로드에 실패하였습니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
    //   }
    // }
    // if(deletePrevThumbNail && !gettingThumbNail) {
    //   deleteThumbNailFieldData = true;
    // }
    // const thumbNailFieldNeedChange = gettingThumbNail || deleteThumbNailFieldData;
    // 추가
    let firstThumbNail;
    if (addThumbNailArr) {
        try {
            await Promise.all(addThumbNailArr.map(async (fileObj, index) => {
                const url = await (0, AWS_1.async_uploadThumbNailS3)(fileObj, logInUserId, dateForUnique);
                if (index === 0) {
                    firstThumbNail = url;
                }
            }));
        }
        catch (e) {
            return returnUploadFailNeedWhichAndError("thumbNail", e);
        }
    }
    let newThumbNail = undefined;
    if (changeThumbNail === null) {
        // 그냥 이전 ThumbNail null 로. 이건 파일 목록이 없어야 되는건데 이것도 확인할까?
        const prevThumbNail = oldDiary.thumbNail;
        if (prevThumbNail === null) {
            console.error("get thumbNail change but not have prev thumbNail. Hacking suspected");
            return { ok: false, error: "이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
        }
        newThumbNail = null;
    }
    else if (changeThumbNail === true) {
        // wholeFileArr 0번째를 썸넬로. m3u8 이면 url 뽑아서 걔로 넣음.
        // 뭐 체크해줘야 할거 같은데 위에서 해주면 될라나?
        const isVideo = wholeFileArr[0].split("/").includes("video");
        // firstThumbNail 있는지 체크 해야하나?
        newThumbNail = isVideo ? firstThumbNail : wholeFileArr[0];
    }
    // youtubeId 를 null 로 보내면 null 이 받아지고 아예 안보내면 undefined 이 받아짐. null 로 보낸거는 음악을 지운다는 얘기라 null 로 업데이트 해줌
    const isThumbNailChanged = newThumbNail !== undefined;
    const isGetYoutubeId = youtubeId !== undefined;
    const isGetSummaryBody = summaryBody !== undefined;
    const result = await client.diary.update({
        where: {
            id
        },
        data: {
            ...(title && { title }),
            ...(body && { body }),
            // gettingThumbNail 있으면 새 썸넬, 없고 deleteThumbNailFieldData true 면 null 
            // ...( thumbNailFieldNeedChange && { thumbNail: gettingThumbNail ?? null }),
            ...(isThumbNailChanged && { thumbNail: newThumbNail }),
            ...(wholeFileArr && { file: wholeFileArr }),
            ...(isGetYoutubeId && { youtubeId }),
            ...(isGetSummaryBody && { summaryBody }), // null 도 없는걸로 업데이트 되는거임
        },
        select: {
            // id:true,
            dateTime: true,
        },
    });
    // youtubeId 있을 때 ytIdArr 에도 없으면 추가
    if (youtubeId) {
        await (0, diary_utils_1.getAndSetUserYtIdArr)(client, logInUserId, youtubeId);
    }
    // const result = await client.diary.findFirst({
    //   where:{
    //     id,
    //   },
    //   select:{
    //     // id:true,
    //     // thumbNail:true,
    //     dateTime:true,
    //   },
    // });
    // 캘린더 데이터 변경
    if (title || isGetSummaryBody) {
        //   const { diaryYear, tableName, convertedMonth } = getDateDataForCalendar(result.dateTime);
        //   // deleteDiary 랑 똑같음.
        //   // get
        //   // const prevDiaryListData = await client.y22.findUnique({
        //   const prevDiaryListData = await client[tableName].findUnique({
        //     where:{
        //       userId:loggedInUser.id,
        //     },
        //     select:{
        //       // m2:true,
        //       [convertedMonth]:true,
        //     },
        //   });
        //   let updatedDiaryListData: Prisma.JsonArray;
        //   const monthColumnData = prevDiaryListData?.[convertedMonth];
        //   const isMonthColumnArray = monthColumnData && Array.isArray(monthColumnData);
        //   if(!isMonthColumnArray) {
        //     return consoleErrorMayBeLogicFail();
        //   }
        //   // 변경
        //   if(tableName === "beforeY22") {
        //     // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
        //     // Diary 있으면 여기에 없을 리가 없는데 그래도 null check 해줄까? 아 error 리턴해야겠다
        //     const yearIndex = monthColumnData.findIndex((yearObject:Prisma.JsonObject)=>Boolean(yearObject[diaryYear]));
        //     // const checkYearDataAndIfExistReturnYearIndex = monthColumnData && Array.isArray(monthColumnData) && monthColumnData.findIndex((yearObject:Prisma.JsonObject)=>Boolean(yearObject[diaryYear]));
        //     // yearObject[stringCreatedYear] 있으면 true 없으면 false? ex) yearObject.2014 없으면 undefined
        //     // null/undefined 아니고 -1 아냐(해당 year 가 존재한다)
        //     // const checkRight = typeof checkYearDataAndIfExistReturnYearIndex === "number" && checkYearDataAndIfExistReturnYearIndex !== -1;
        //     const checkRight = yearIndex !== -1;
        //     if(!checkRight) {
        //       // 여기서 return 하면 걍 updateForCalendarData 의 값으로 나옴. 결과로 { ok:false, error:"캘린더 데이터 없음" }; 반환할라면 외부에 변수 선언해서 그걸로 return 하게 만들어야함.
        //       return consoleErrorMayBeLogicFail();
        //     }
        //     // 변수명 깔끔하게 변경
        //     // const yearIndex = checkYearDataAndIfExistReturnYearIndex;
        //     const year = diaryYear;
        //     // 여기까지 deleteDiary 랑 동일
        //     // 근데 얘는 만약에 !checkRight 면 데이터 추가할까?
        //     // [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ]
        //     updatedDiaryListData = monthColumnData;
        //     const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].map((dateData:{id:number,date:number,title:string})=>{
        //       const dataId = dateData.id;
        //       if(dataId !== id) return dateData;
        //       const newDateData = {...dateData,title};
        //       return newDateData;
        //     });
        //     updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;
        //   } else {
        //     // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
        //     // if (prevDiaryListData?.m1 && Array.isArray(prevDiaryListData?.m1)) {
        //     //   updatedDiaryListData = [ ...prevDiaryListData.m1, addDiaryData ];
        //     // const checkRight = monthColumnData && Array.isArray(monthColumnData);
        //     // if(!checkRight) {
        //     //   // 여기서 return 하면 걍 updateForCalendarData 의 값으로 나옴. 결과로 { ok:false, error:"캘린더 데이터 없음" }; 반환할라면 외부에 변수 선언해서 그걸로 return 하게 만들어야함.
        //     //   return consoleErrorMayBeLogicFail();
        //     // }
        //     // 얘도 여기까지 deleteDiary 랑 동일
        //     // updatedDiaryListData = monthColumnData.filter((dateData:{id:number,date:number,title:string})=>dateData.id !== id);
        //     updatedDiaryListData = monthColumnData.map((dateData:{id:number,date:number,title:string})=>{
        //       const dataId = dateData.id;
        //       if(dataId !== id) return dateData;
        //       const newDateData = {...dateData,title};
        //       return newDateData;
        //     });
        //   }
        //   // update
        //   await client[tableName].update({
        //     where:{
        //       userId:loggedInUser.id,
        //     },
        //     data:{
        //       // null 말고 Prisma.DbNull 써야 된대.
        //       [convertedMonth]:updatedDiaryListData,
        //     },
        //     select:{
        //       id:true,
        //     },
        //   });
        const workTypeAndNeededData = {
            editDiary: {
                id,
                // title,
                ...(title && { title }),
                ...(isGetSummaryBody && { summaryBody }),
            }
        };
        // await updateCalendarData(workTypeAndNeededData,result.dateTime,loggedInUser.id);
        await (0, updateCalendarData_1.default)(workTypeAndNeededData, result.dateTime, logInUserId);
    }
    // 결과 Diary 도 보내줘야 할거 같은데..
    return { ok: true };
};
const resolver = {
    Mutation: {
        editDiary: (0, user_utils_1.protectResolver)(editDiaryFn),
    },
};
exports.default = resolver;
const returnUploadFailNeedWhichAndError = (which, error) => {
    console.log(error);
    console.log(`editDiary // S3 ${which} upload error`);
    return { ok: false, error: "업로드에 실패하였습니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
};
// // 동영상 하나로 바꾼 후
// import updateCalendarData from "../../forCalendar/updateCalendarData";
// import { async_deletePhotoS3, async_uploadPhotoS3, async_uploadThumbNailS3, S3_FOLDER_NAME } from "../../shared/AWS";
// import { Resolver, Resolvers } from "../../types";
// import { protectResolver } from "../../user/user.utils";
// import { getAndSetUserYtIdArr } from "../diary.utils";
// const editDiaryFn: Resolver = async(_, {id, title, body, changeThumbNail, addFileArr, addFileIndexArr, videoFile, videoIndex, videoThumbNail, deleteFileArr, wholeFileArr, youtubeId, summaryBody,}:{id:number, title?:string, body?:Array<string>, changeThumbNail?:boolean|null, addFileArr?:Array<any>, addFileIndexArr?:Array<number>, videoFile?: any, videoIndex?: number, videoThumbNail?: any, deleteFileArr?:Array<string>, wholeFileArr?:Array<string>, youtubeId:string | null | undefined, summaryBody?:string|null}, {client, logInUserId}) => {
//   const oldDiary = await client.diary.findFirst({
//     where:{
//       id,
//       // userId:loggedInUser.id,
//       userId:logInUserId,
//     },
//     select:{
//       // id:true,
//       thumbNail:true,
//     },
//   });
//   if(!oldDiary) {
//     console.error("editDiary // try to change not exist / another user's diary. Hacking suspected")
//     return { ok:false, error:"존재하지 않는 일기입니다." };
//   }
//   // 일단 받은 배열 wholeFileArr 에 결과를 집어넣음
//   // if(wholeFileArr?.length > 10) {
//   //   return {ok:false, error:"한 게시물 당 10개 이상의 사진을 올릴 수 없습니다."}
//   // }
//   //// 비디오 추가 ////
//   if(addFileArr.some(file=>file.file?.mimetype !== "image/jpeg")) {
//     console.error("editDiary // addFileArr get something not image. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   // videoThumbNail videoIndex videoFile 다 있거나 다 없거나 아니면 return
//   // undefined < 0 도 false 임.
//   const getVideoValid = videoThumbNail && videoIndex > -1 && videoFile && videoFile.file?.mimetype === "video/mp4" && videoThumbNail.file?.mimetype === "image/jpeg";
//   const notGetVideoValid = !videoThumbNail && videoIndex === undefined && !videoFile;
//   if (!(getVideoValid || notGetVideoValid)) {
//     console.error("editDiary // invalid video type. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   if(videoIndex !== undefined && wholeFileArr?.length < videoIndex) {
//     console.error("editDiary // videoIndex is bigger than fileArr.length. Hacking possibility.");
//     return { ok:false, error:"잘못된 형식입니다." };
//   }
//   const getVideo = getVideoValid;
//   const notGetVideo = notGetVideoValid;
//   //// 여기까지 비디오 추가 ////
//   // if(wholeFileArr && !addFileArr && !addFileIndexArr && !deleteFileArr) {
//   if(wholeFileArr && !addFileArr && !addFileIndexArr && !deleteFileArr && notGetVideo) {
//     // wholeFileArr 가 왔는데 addFileArr, addFileIndexArr, deleteFileArr, video 가 같이 안오면 에러. 이상한 접근.
//     console.log("editDiary // wholeFileArr doesn't get with addFileArr, addFileIndexArr, deleteFileArr, video")
//     return {ok:false, error:"알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//   }
//   if(addFileArr?.length !== addFileIndexArr?.length) {
//     // addFileArr, addFileIndexArr 하나만 왔거나 addFileArr, addFileIndexArr length 가 안맞으면 이상한 접근.
//     console.log("editDiary // get either addFileArr, addFileIndexArr or addFileArr, addFileIndexArr length is not same.")
//     return {ok:false, error:"알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//   }
//   //// 비디오 추가 ////
//   const noWholeFile = !wholeFileArr || wholeFileArr.length === 0;
//   if(getVideo && noWholeFile) {
//     console.error("editDiary // get video without wholeFileArr. Hacking suspected.");
//     return {ok:false, error:"알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."};
//   }
//   if(getVideo && wholeFileArr[videoIndex] !== "") {
//     console.error("editDiary // get video but wholeFileArr videoIndex is not empty. Hacking suspected.");
//     return {ok:false, error:"알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."};
//   }
//   const wholeFileArrHaveVideo = wholeFileArr.some(file=>{
//     const length = file.length;
//     const type = file.substring(length-3,length);
//     return type === "mp4" || type === "3u8";
//   });
//   if(getVideo && wholeFileArrHaveVideo) {
//     console.error("editDiary // get video with wholeFileArr have video. Hacking suspected.");
//     return {ok:false, error:"알 수 없는 접근입니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."};
//   }
//   //// 여기까지 비디오 추가 ////
//     // deleteFileArr, wholeFileArr 왔을 때 검증. 이전 사진 목록과 대조.
//   if (deleteFileArr || wholeFileArr) {
//     // 이전 사진 목록
//     const prevDiary = await client.diary.findUnique({
//       where:{
//         id
//       },
//       select:{
//         file:true,
//       },
//     });
//     const prevJsonFileArr = prevDiary.file;
//     let prevFileArr = [];
//     if(prevJsonFileArr && typeof prevJsonFileArr === 'object' && Array.isArray(prevJsonFileArr)) {
//       prevFileArr = prevJsonFileArr;
//     }
//     // 전체 목록이 이전에 있는 목록이랑 다른지. 그것도 확인
//     if (wholeFileArr) {
//       try {
//         wholeFileArr.map((url:string) => {
//           // 추가할 곳은 넘어감
//           if(url === "") return;
//           const isInPrevFile = prevFileArr.includes(url);
//           // 없으면 에러 메세지 출력하고 에러 메세지 전송.
//           if(!isInPrevFile){
//             throw Error("editDiary // wholeFileArr has file which is not on prevFileArr. Hacking suspected.")
//           }
//         })
//       } catch (e) {
//         console.log(e);
//         return { ok:false, error:"이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//       }
//     }
//     if (deleteFileArr){
//       // 여기서 하나라도 다른게 있으면 아예 삭제를 안하거나, 아니면 있는 애들은 지우고 없는 거만 오류 출력하거나.
//       // 캐시를 쓰면 실제 데이터와 로컬 데이터가 달라질 수 있어서 문제가 있을 거 같긴 한데, 그래도 아예 안하게 하는게 낫겠지?
//       try {
//         deleteFileArr.map((url:string) => {
//           const isInPrevFile = prevFileArr.includes(url);
//           // 없으면 에러 메세지 출력하고 에러 메세지 전송.
//           if(!isInPrevFile){
//             throw Error("editDiary // deleteFileArr has file which is not on prevFileArr. Hacking suspected.")
//           }
//         })
//       } catch (e) {
//         console.log(e);
//         return { ok:false, error:"이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//       }
//       // S3 삭제
//       try {
//         await Promise.all(
//           deleteFileArr.map((async(deleteFileUrl:string) => {
//             // await async_deletePhotoS3(deleteFileUrl,S3_FOLDER_NAME);
//             await async_deletePhotoS3(deleteFileUrl);
//           }))
//         )
//       } catch (e) {
//         return {ok:false, error:"Delete file Error"}
//       }
//     } 
//   }
//   const dateForUnique = Date.now();
//   if(addFileArr){
//     try {
//       await Promise.all(
//         addFileArr.map(async (fileObj,index) => {
//           const url = await async_uploadPhotoS3(fileObj, logInUserId, dateForUnique, S3_FOLDER_NAME);
//           wholeFileArr[addFileIndexArr[index]] = url;
//         })
//       )
//     } catch (e) {
//       return returnUploadFailNeedWhichAndError("image/video",e);
//     }
//   }
//   //  근데 만약 사진은 지웠는데 올리는데서 오류났어, 그러면 다시 복구하는 코드도 작성해야 하지 않나??
//   // 날림
//   // let deleteThumbNailFieldData;
//   // let gettingThumbNail;
//   // if(thumbNail) {
//   //   try {
//   //     // gettingThumbNail = await async_uploadPhotoS3(thumbNail, loggedInUser.id, S3_FOLDER_NAME);
//   //     gettingThumbNail = await async_uploadPhotoS3(thumbNail, logInUserId, S3_FOLDER_NAME);
//   //   } catch (e) {
//   //     console.log(e);
//   //     console.log("editDiary // S3 사진 업로드 오류");
//   //     return {ok:false, error:"업로드에 실패하였습니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//   //   }
//   // }
//   // if(deletePrevThumbNail && !gettingThumbNail) {
//   //   deleteThumbNailFieldData = true;
//   // }
//   // const thumbNailFieldNeedChange = gettingThumbNail || deleteThumbNailFieldData;
//   //// 비디오 변경 ////
//   let firstThumbNail: string;
//   if(getVideo){
//     try {
//       const videoThumbNailUrl = await async_uploadThumbNailS3(videoThumbNail, logInUserId, dateForUnique);
//       if(videoIndex === 0) { firstThumbNail = videoThumbNailUrl; }
//       const videoUrl = await async_uploadPhotoS3(videoFile, logInUserId, dateForUnique, S3_FOLDER_NAME);
//       wholeFileArr[addFileIndexArr[videoIndex]] = videoUrl;
//     } catch (e) {
//       return returnUploadFailNeedWhichAndError("getVideo",e);
//     }
//   }
//   //// 여기까지 비디오 추가 ////
//   let newThumbNail: string|undefined|null = undefined;
//   if (changeThumbNail === null) {
//     // 그냥 이전 ThumbNail null 로. 이건 파일 목록이 없어야 되는건데 이것도 확인할까?
//     const prevThumbNail = oldDiary.thumbNail;
//     if(prevThumbNail === null) {
//       console.error("get thumbNail change but not have prev thumbNail. Hacking suspected");
//       return {ok:false,error:"이전 사진들 목록과 다릅니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다."}
//     }
//     newThumbNail = null;
//   } else if (changeThumbNail === true) {
//     // wholeFileArr 0번째를 썸넬로. m3u8 이면 url 뽑아서 걔로 넣음.
//     // 뭐 체크해줘야 할거 같은데 위에서 해주면 될라나?
//     const isVideo = wholeFileArr[0].split("/").includes("video");
//     // firstThumbNail 있는지 체크 해야하나?
//     newThumbNail = isVideo ? firstThumbNail : wholeFileArr[0];
//   }
//   // youtubeId 를 null 로 보내면 null 이 받아지고 아예 안보내면 undefined 이 받아짐. null 로 보낸거는 음악을 지운다는 얘기라 null 로 업데이트 해줌
//   const isThumbNailChanged = newThumbNail !== undefined;
//   const isGetYoutubeId = youtubeId !== undefined;
//   const isGetSummaryBody = summaryBody !== undefined;
//   const result = await client.diary.update({
//     where:{
//       id
//     },
//     data:{
//       ...( title && { title }),
//       ...( body && { body }),
//       // gettingThumbNail 있으면 새 썸넬, 없고 deleteThumbNailFieldData true 면 null 
//       // ...( thumbNailFieldNeedChange && { thumbNail: gettingThumbNail ?? null }),
//       ...( isThumbNailChanged && { thumbNail: newThumbNail }),
//       ...( wholeFileArr && { file: wholeFileArr }),
//       ...( isGetYoutubeId && { youtubeId } ),
//       ...( isGetSummaryBody && { summaryBody }), // null 도 없는걸로 업데이트 되는거임
//     },
//     select:{
//       // id:true,
//       dateTime:true,
//     },
//   });
//   // youtubeId 있을 때 ytIdArr 에도 없으면 추가
//   if(youtubeId){
//     await getAndSetUserYtIdArr(client,logInUserId,youtubeId);
//   }
//   // const result = await client.diary.findFirst({
//   //   where:{
//   //     id,
//   //   },
//   //   select:{
//   //     // id:true,
//   //     // thumbNail:true,
//   //     dateTime:true,
//   //   },
//   // });
//   // 캘린더 데이터 변경
//   if(title || isGetSummaryBody) {
//     const workTypeAndNeededData = {
//       editDiary:{
//         id,
//         // title,
//         ...(title && { title }), // title 이 없을 수도 있게 됬음. 그전엔 얘밖에 없어서 필수라 그냥 title 넣었는데 이제는 있는지 확인해야함
//         ...(isGetSummaryBody && { summaryBody }),
//       }
//     };
//     // await updateCalendarData(workTypeAndNeededData,result.dateTime,loggedInUser.id);
//     await updateCalendarData(workTypeAndNeededData,result.dateTime,logInUserId);
//   }
//   // 결과 Diary 도 보내줘야 할거 같은데..
//   return { ok:true };
// };
// const resolver: Resolvers = {
//   Mutation: {
//     editDiary: protectResolver(editDiaryFn),
//   },
// };
// export default resolver;
// const returnUploadFailNeedWhichAndError = (which:string,error:any) => {
//   console.log(error);
//   console.log(`editDiary // S3 ${which} upload error`);
//   return { ok:false, error:"업로드에 실패하였습니다. 계속해서 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
// };
