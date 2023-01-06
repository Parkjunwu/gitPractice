import updateCalendarData from "../../forCalendar/updateCalendarData";
import { async_deletePhotoS3 } from "../../shared/AWS";
import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";

// const deleteDiaryFn:Resolver = async(_,{id},{loggedInUser,client}) => {
const deleteDiaryFn:Resolver = async(_,{id},{logInUserId,client}) => {
  const diary = await client.diary.findUnique({
    where:{
      id,
    },
    select:{
      userId:true,
      file:true,
      // thumbNail:true,
    },
  });

  // const loggedInUserId = loggedInUser.id;

  if(!diary) {
    return { ok:false, error:"diary not found"};
  } else if (diary.userId !== logInUserId) {
    console.error("deleteDiary // try to delete another user's diary. Hacking possibility.");
    return { ok:false, error:"Not authorized" };
  }

  // S3 파일 삭제
  // const thumbNail = diary.thumbNail;
  const fileJson = diary.file;
  try {
    // if(thumbNail){
    //   await async_deletePhotoS3(thumbNail,S3_FOLDER_NAME);
    // }
    if(fileJson && typeof fileJson === 'object' && Array.isArray(fileJson)){
      await Promise.all(
        fileJson.map((async(fileUrl:string) => {
          // await async_deletePhotoS3(fileUrl,S3_FOLDER_NAME);
          await async_deletePhotoS3(fileUrl);
        }))
      );
    }
  } catch (e) {
    // 일단 에러 반환하고 나중엔 로그만 찍게
    console.error("deleteDiary // S3 delete error");
    return {ok:false, error:"Delete file Error"};
  }

  // 일기 삭제
  const result = await client.diary.delete({
    where:{
      id,
    },
    select:{
      dateTime:true,
    },
  });

  // totalDiary 변경
  // const prevLoggedInUserTotalDiary = loggedInUser.totalDiary;
  const logInUser = await client.user.findUnique({
    where:{
      id:logInUserId,
    },
    select:{
      totalDiary:true,
    },
  });

  const prevLoggedInUserTotalDiary = logInUser.totalDiary;

  await client.user.update({
    where:{
      id:logInUserId,
    },
    data:{
      totalDiary:prevLoggedInUserTotalDiary-1,
    },
    select:{
      id:true,
    },
  });

  // // 캘린더 데이터 삭제
  // const { diaryYear, tableName, convertedMonth } = getDateDataForCalendar(result.dateTime);
  // // const diaryDateTime = result.dateTime;
  // // const diaryYear = Math.floor(diaryDateTime/10000); 
  // // const diaryEmpty = diaryDateTime - diaryYear*10000;
  // // const diaryMonth = Math.floor(diaryEmpty/100);
  // // // const diaryDate = diaryEmpty - diaryMonth*100;
  
  // // const isNowOrOnTableYear = diaryYear === nowYear || prevYearsOnDataBaseList.includes(diaryYear);

  // // const tableName = isNowOrOnTableYear ? "y"+ String(diaryDateTime).substring(2,4) : "beforeY22";

  // // const convertedMonth = "m"+diaryMonth;

  // // 로직 작성
  // // 주석은 얘가 tableName 지정 안해서 타입이 안나와서 볼라고 넣은거. y22 의 m1 기준.
  // const updateForCalendarData = async(tableName:string) => {
  //   // const prevDiaryListData = await client.y22.findUnique({
  //   const prevDiaryListData = await client[tableName].findUnique({
  //     where:{
  //  //     userId:loggedInUserId,
  //       userId:logInUserId,
  //     },
  //     select:{
  //       // m1:true,
  //       [convertedMonth]:true,
  //     },
  //   });

  //   let updatedDiaryListData: Prisma.JsonArray;

  //   if(tableName === "beforeY22") {
  //     // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
  //     // Diary 있으면 여기에 없을 리가 없는데 그래도 null check 해줄까? 아 error 리턴해야겠다
  //     const checkYearDataAndIfExistReturnYearIndex = prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth]) && prevDiaryListData[convertedMonth].findIndex((yearObject:Prisma.JsonObject)=>Boolean(yearObject[diaryYear]));
  //     // yearObject[stringCreatedYear] 있으면 true 없으면 false? ex) yearObject.2014 없으면 undefined

  //     // null/undefined 아니고 -1 아냐(해당 year 가 존재한다)
  //     const checkRight = typeof checkYearDataAndIfExistReturnYearIndex === "number" && checkYearDataAndIfExistReturnYearIndex !== -1;

  //     if(!checkRight) {
  //       // 여기서 return 하면 걍 updateForCalendarData 의 값으로 나옴. 결과로 { ok:false, error:"캘린더 데이터 없음" }; 반환할라면 외부에 변수 선언해서 그걸로 return 하게 만들어야함.
  //       return consoleErrorMayBeLogicFail();
  //     }

  //     // 변수명 깔끔하게 변경
  //     const yearIndex = checkYearDataAndIfExistReturnYearIndex;
  //     const year = diaryYear;

  //     // [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ]
  //     updatedDiaryListData = prevDiaryListData[convertedMonth];

  //     // date 가 맞는지 검증은 안해도 되겠지?
  //     const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].filter((dateData:{id:number,date:number,title:string})=>dateData.id !== id);
      
  //     if(thisDiaryDeletedYearData.length === 0) {
  //       // [ {"2000":[]}, {"2002":[{date~~}]} ] 처럼 해당 년 데이터가 없어진 경우 2000년 같이
  //       if(updatedDiaryListData.length === 1) {
  //         // [ {"2000":[]} ] 이렇게만 남으면 아예 그 행을 null 로
  //         updatedDiaryListData = null;
  //       } else {
  //         // [ {"2002":[{date~~}]} ]  2000 값을 지움.
  //         updatedDiaryListData = updatedDiaryListData.filter((yearData:{[key:string]:any})=>!yearData[year]);
  //       }
  //     } else {
  //       // 그 외 일반적인 경우. [ {"2000":[{date~~}]}, {"2002":[{date~~}]} ]
  //       updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;
  //     }
    
  //   } else {
  //     // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
  //     // if (prevDiaryListData?.m1 && Array.isArray(prevDiaryListData?.m1)) {
  //     //   updatedDiaryListData = [ ...prevDiaryListData.m1, addDiaryData ];
  //     const checkRight = prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData[convertedMonth]);

  //     if(!checkRight) {
  //       // 여기서 return 하면 걍 updateForCalendarData 의 값으로 나옴. 결과로 { ok:false, error:"캘린더 데이터 없음" }; 반환할라면 외부에 변수 선언해서 그걸로 return 하게 만들어야함.
  //       return consoleErrorMayBeLogicFail();
  //     }

  //     // if (prevDiaryListData?.[convertedMonth] && Array.isArray(prevDiaryListData?.[convertedMonth])) {
  //     updatedDiaryListData = prevDiaryListData[convertedMonth].filter((dateData:{id:number,date:number,title:string})=>dateData.id !== id);

  //     if(updatedDiaryListData.length === 0) {
  //       // 데이터 없어서 [] 이 되면 걍 null 로
  //       updatedDiaryListData = null;
  //     }
  //   }

  //   await client[tableName].update({
  //     where:{
  //  //     userId:loggedInUserId,
  //       userId:logInUserId,
  //     },
  //     data:{
  //       // null 말고 Prisma.DbNull 써야 된대.
  //       [convertedMonth]:updatedDiaryListData ?? Prisma.DbNull,
  //     },
  //     select:{
  //       id:true,
  //     },
  //   });

  // };

  // // tableName ("y22", "y23", "beforeY22" 등) 넣어서 실행.
  // await updateForCalendarData(tableName);

  const workTypeAndNeededData = {
    deleteDiary:{
      id,
    }
  };

  await updateCalendarData(workTypeAndNeededData,result.dateTime,logInUserId);

  return { ok: true };
};

const resolver:Resolvers = {
  Mutation: {
    deleteDiary:protectResolver(deleteDiaryFn),
  },
};

export default resolver;