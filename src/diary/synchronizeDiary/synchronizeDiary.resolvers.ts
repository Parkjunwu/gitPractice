import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";
import { getNow } from "../../yearCheckList";
import { dateTimeCheckIfOkReturnFormDateElseError } from "./synchronizeDiaryTypeCheck";

type uploadDiariesType = {
  title: string;
  body: string;
  // dateTime: string;
  dateTime: number;
  youtubeId?: string;
};

type variableType = {
  uploadDiaries: uploadDiariesType[];
};

type makeUpdateDataType = {
  yearTableName: string, // "y22"|"y23"|"beforeY22"
  prevYearlyDateArrOnMonthObj: any,
  changeMonthArr: string[],
  changedYearlyDateArrOnMonthObj: any,
};

// const synchronizeDiaryFn: Resolver = async(_,{uploadDiaries}:variableType,{client,loggedInUser}) => {
const synchronizeDiaryFn: Resolver = async(_,{uploadDiaries}:variableType,{client,logInUserId}) => {

  // dateTime 만 타입체크 하면 될듯.

  const eachDiaryUploadFnArr: Array<Promise<unknown>> = [];
  
  const calendarUploadObj: {[key:string]:any} = {};

  // () => Promise<void> 로 보내면 안되는듯. await get() 이런 실행 함수가 들어가야 하나봄
  // Promise 안에 async 쓰지 말래. 되기는 함.
  // 타입 체크를 여기서 해도 되겠네. 에러 던져서 빠져나오게?
  // 근데 이거는 중간에 놈이 안맞으면 앞에 애들은 저장되는 문제가 있음.
  // Now 는 여기서 한번만 받아서 보내줌
  const { nowYear, nowMonth, nowDate } = getNow();
  const nowFullDate = nowYear*10000 + nowMonth*100 + nowDate;

  // const userId = loggedInUser.id;
  const userId = logInUserId;

  try {
    uploadDiaries.map(eachDiary => {

      const { title, body, dateTime, youtubeId } = eachDiary;

      // 얘가 타입 체크하고 반환함. 문제 있을 시 error 반환
      const {
        date,
        year,
        month,
        yearSimple,
      } = dateTimeCheckIfOkReturnFormDateElseError({
        dateTime,
        nowFullDate,
        nowYear,
        nowMonth,
        nowDate,
      });

      const summaryBody = body.length > 40 ? body.substring(0,37) + "..." : body;

      eachDiaryUploadFnArr.push(new Promise((resolve) => {
        // diary 업로드
        client.diary.create({
          data:{
            user:{
              connect:{
                id:userId
              },
            },
            title,
            file: [],
            body: [body],
            summaryBody,
            dateTime,
            ...(youtubeId && { youtubeId }),
          },
          select:{
            id:true,
          },
        })
          .then(result => {
            const id = result.id;
            const diaryInfo = { id, date, title, summaryBody, };
            const inputYearIndex = (yearSimple === 22 || yearSimple === 23) ? `y${yearSimple}` : "beforeY22";
            const inputMonthIndex = `m${month}`;

            // 얘는 calendarUploadObj 를 바꾸는 거라 빼기가 좀 그렇네
            if(inputYearIndex === "beforeY22") {

              const beforeY22Data = calendarUploadObj.beforeY22;
              // { beforeY22: { m2: [{ 2014: [{date:1,id:2,title:"우왕"}] }] } } 이런식
              if(!beforeY22Data) {
                return calendarUploadObj.beforeY22 = { [inputMonthIndex] : [{[year]:[diaryInfo]}] }
              }
              const monthData = beforeY22Data[inputMonthIndex];
              if (!monthData) {
                return calendarUploadObj.beforeY22[inputMonthIndex] = [{[year]:[diaryInfo]}];
              } 
              const yearIndex = monthData.findIndex(eachMonthData=>eachMonthData[year]);
              const noYearData = yearIndex === -1;
              if (noYearData) {
                const newMonthData = [...monthData];
                newMonthData.push({[year]:[diaryInfo]});
                calendarUploadObj.beforeY22[inputMonthIndex] = newMonthData;
              } else {
                const newYearData = [...monthData[yearIndex][year], diaryInfo];
                calendarUploadObj.beforeY22[inputMonthIndex][yearIndex][year] = newYearData;
              }

            } else {
              // { y22: { m2: [{date:1,id:2,title:"우왕"}] } } 이런식
              !calendarUploadObj[inputYearIndex] ?
                calendarUploadObj[inputYearIndex] = { [inputMonthIndex] : [diaryInfo] }
              :
                calendarUploadObj[inputYearIndex][inputMonthIndex] = [
                  diaryInfo,
                  ...(calendarUploadObj[inputYearIndex][inputMonthIndex] ?? []), // 얘도 [...null] 안됨
                ]
            } 
          })
          .then(()=>resolve(1));
      }));
    });
  } catch (e) {
    console.error(e + "Hacking possibility");
    return { ok:false, error:"잘못된 형식입니다." };
  }

  try {
    // 위에서 받아서 각각 바로 calendar 변경하면 읽기 쓰기가 async 라 변경되기 전의 값을 읽어서 씹힘.
    // 근데 Promise 로 해도 내부 로직이 그냥 동기 로직이면 큐에 올라온 동기 코드는 결국 싱글 스레드로 되니까 동기 코드 자체는 상관  없음.
    await Promise.all(eachDiaryUploadFnArr);
  } catch (e) {
    console.error("synchronizeDiary // Promise.all error");
    return { ok:false, error:"업로드에 실패하였습니다." };
  }

  const calendarUploadFnArr: Array<Promise<unknown>> = [];

  
  for (const yearTableName in calendarUploadObj){
    // calendarUploadObj
    // { beforeY22: { m2: [{ 2014: [{date:1,id:2,title:"우왕"}] }] } }
    // { y22: { m2: [{date:1,id:2,title:"우왕"}] } }
      
    const changedYearlyDateArrOnMonthObj = calendarUploadObj[yearTableName];
    // { m2: [{ 2014: [{date:1,id:2,title:"우왕"}] }
    // { m2: [{date:1,id:2,title:"우왕"}] }
    
    const changeMonthArr = Object.keys(changedYearlyDateArrOnMonthObj); // [m2,m4,m11]
    
    const selectOnlyChangedMonth: {[key:string]:true} = {}; // { m2:true, m4:true, m11:true }
  
    changeMonthArr.map(month => selectOnlyChangedMonth[month] = true);

    const whereLoggedInUser = { userId };

    calendarUploadFnArr.push(new Promise((resolve) => {
      // 이전 데이터 받아
      // client.y22.findUnique({
      client[yearTableName].findUnique({
        where: whereLoggedInUser,
        select: selectOnlyChangedMonth,
      })
        .then(prevYearlyDateArrOnMonthObj => {
          
          // 없으면 create 있으면 update
          if(!prevYearlyDateArrOnMonthObj) {
            // return client.y22.create({
            return client[yearTableName].create({
              data:{
                user:{
                  connect:{
                    id:userId,
                  },
                },
                ...changedYearlyDateArrOnMonthObj,
              },
            });
          }

          const prevAndNowConvertedData = makeUpdateData({
            yearTableName,
            prevYearlyDateArrOnMonthObj,
            changeMonthArr,
            changedYearlyDateArrOnMonthObj,
          });

          // return client.y22.update({
          return client[yearTableName].update({
            where: whereLoggedInUser,
            data: prevAndNowConvertedData,
          });
        })
        .then(()=>resolve(1))
    }));
  }

  try{
    await Promise.all(calendarUploadFnArr);
  } catch (e) {
    console.error("synchronizeDiary // calendar error");
    return { ok:false, error:"업로드에 실패하였습니다." };
  }

  // totalDiary 변경
  const syncDiaryNumber = uploadDiaries.length;
  const logInUser = await client.user.findUnique({
    where:{
      id:logInUserId,
    },
    select:{
      totalDiary:true,
    },
  });
  // const prevLoggedInUserTotalDiary = loggedInUser.totalDiary;
  const prevLoggedInUserTotalDiary = logInUser.totalDiary;
  await client.user.update({
    where:{
      id:userId,
    },
    data:{
      totalDiary:prevLoggedInUserTotalDiary+syncDiaryNumber,
    },
    select:{
      id:true,
    },
  });

  return { ok:true };
};

const resolver: Resolvers = {
  Mutation: {
    synchronizeDiary: protectResolver(synchronizeDiaryFn),
  },
};

export default resolver;


const makeUpdateData = ({
    yearTableName,
    prevYearlyDateArrOnMonthObj,
    changeMonthArr,
    changedYearlyDateArrOnMonthObj
  }: makeUpdateDataType) => {

    const dataObj: {[key:string]:any} = {};

    if(yearTableName === "beforeY22") {
      changeMonthArr.map(month => {
        const prevYearlyDateArr = prevYearlyDateArrOnMonthObj[month];
        const changedYearlyDateArr = changedYearlyDateArrOnMonthObj[month];
        if(!prevYearlyDateArr) {
          dataObj[month] = changedYearlyDateArr;
        } else {
          changedYearlyDateArr.map((aYearlyDateArr)=>{
            const year = Object.keys(aYearlyDateArr)[0];
            const prevDataYearIndex = prevYearlyDateArr.findIndex(eachYearlyDateArr=>eachYearlyDateArr[year]);
            const noPrevYearlyDateArr = prevDataYearIndex === -1;
            if(noPrevYearlyDateArr) {
              dataObj[month] = [...prevYearlyDateArr,aYearlyDateArr];
            } else {
              const copiedArr = [...prevYearlyDateArr];
              copiedArr[prevDataYearIndex][year] = [...copiedArr[prevDataYearIndex][year],...aYearlyDateArr[year]];
              dataObj[month] = copiedArr;
            }
          })
        }
      });
    } else {
      // y22, y23~ 인 경우
      // [...null] 은 에러뜸. {...null} 이랑 다른 듯.
      changeMonthArr.map(month => dataObj[month] = [...(prevYearlyDateArrOnMonthObj[month] ?? []),...changedYearlyDateArrOnMonthObj[month]]);
    }
    return dataObj;
  };










    // beforeY22 랑 나눈거

    // if(yearTableName === "y22" || yearTableName === "y23"){
    //   // calendarUploadObj // { y22: { m2: [{date:1,id:2,title:"우왕"}] } }
      
    //   const changedYearlyDateArrOnMonthObj = calendarUploadObj[yearTableName]; // { m2: [{date:1,id:2,title:"우왕"}] }
      
    //   const changeMonthArr = Object.keys(changedYearlyDateArrOnMonthObj); // [m2,m4,m11]
      
    //   const selectOnlyChangedMonth: {[key:string]:true} = {}; // { m2:true, m4:true, m11:true }
    //   changeMonthArr.map(month => selectOnlyChangedMonth[month] = true);

    //   // const makeUpdateData = (result: Y22 | BeforeY22) => {
    //   //   const dataObj: {[key:string]:any} = {};
    //   //   changeMonthArr.map(month => dataObj[month] = [...result[month],...changedYearlyDateArrOnMonthObj[month]]);
    //   //   return dataObj;
    //   // };
      
    //   const whereLoggedInUser = { userId };

    //   calendarUploadFnArr.push(new Promise((resolve) => {
    //     // 이전 데이터 받아
    //     client[yearTableName].findUnique({
    //       where: whereLoggedInUser,
    //       select: selectOnlyChangedMonth,
    //     })
    //       .then(prevYearlyDateArrOnMonthObj => {
            
    //         // 근데 만약에 아예 없으면 update 말고 create 로 해야하는거 아닌가
    //         if(!prevYearlyDateArrOnMonthObj) {
    //           return client.y22.create({
    //             data:{
    //               user:{
    //                 connect:{
    //                   id:userId,
    //                 },
    //               },
    //               ...changedYearlyDateArrOnMonthObj,
    //             },
    //           });
    //         }

    //         const prevAndNowConvertedData = makeUpdateData({
    //           yearTableName,
    //           prevYearlyDateArrOnMonthObj,
    //           changeMonthArr,
    //           changedYearlyDateArrOnMonthObj,
    //         });

    //         // return client[yearTableName].update({
    //         return client.y22.update({
    //           where: whereLoggedInUser,
    //           data: prevAndNowConvertedData,
    //         });
    //       })
    //       .then(()=>resolve(1))
    //   }))
    // } else {
    //   // yearTableName === "beforeY22" 인 상황
    //   // calendarUploadObj // { beforeY22: { m2: [{ 2014: [{date:1,id:2,title:"우왕"}] }] } }
      
    //   const changedYearlyDateArrOnMonthObj = calendarUploadObj[yearTableName]; // { m2: [{ 2014: [{date:1,id:2,title:"우왕"}] }
      
    //   const changeMonthArr = Object.keys(changedYearlyDateArrOnMonthObj); // [m2,m4,m11]
      
    //   const selectOnlyChangedMonth: {[key:string]:true} = {}; // { m2:true, m4:true, m11:true }
    //   changeMonthArr.map(month => selectOnlyChangedMonth[month] = true);

    //   const whereLoggedInUser = { userId };
      
    //   calendarUploadFnArr.push(new Promise((resolve) => {
    //     // 이전 데이터 받아
    //     client.beforeY22.findUnique({
    //       where: whereLoggedInUser,
    //       select: selectOnlyChangedMonth,
    //     })
    //       .then(prevYearlyDateArrOnMonthObj => {
            
    //         // 얘도 만약에 아예 없으면 update 말고 create 로 해야하는거 아닌가
    //         if(!prevYearlyDateArrOnMonthObj) {
    //           return client.beforeY22.create({
    //             data:{
    //               user:{
    //                 connect:{
    //                   id:userId,
    //                 },
    //               },
    //               ...changedYearlyDateArrOnMonthObj,
    //             },
    //           });
    //         }


    //         // // beforeY22 인 경우
    //         // const dataObj: {[key:string]:any} = {};
    //         // // prevYearlyDateArrOnMonthObj[month] 가 없으면 걍 넣고 있으면 찾아서 넣어.
    //         // changeMonthArr.map(month => {
    //         //   const prevYearlyDateArr = prevYearlyDateArrOnMonthObj[month];
    //         //   const changedYearlyDateArr = changedYearlyDateArrOnMonthObj[month];
    //         //   if(!prevYearlyDateArr) {
    //         //     dataObj[month] = changedYearlyDateArr;
    //         //   } else {
    //         //     changedYearlyDateArr.map((aYearlyDateArr)=>{
    //         //       const year = Object.keys(aYearlyDateArr)[0];
    //         //       const prevDataYearIndex = prevYearlyDateArr.findIndex(eachYearlyDateArr=>eachYearlyDateArr[year]);
    //         //       const noPrevYearlyDateArr = prevDataYearIndex === -1;
    //         //       if(noPrevYearlyDateArr) {
    //         //         dataObj[month] = [...prevYearlyDateArr,aYearlyDateArr]
    //         //       } else {
    //         //         const copiedArr = [...prevYearlyDateArr];
    //         //         copiedArr[prevDataYearIndex][year] = [...copiedArr[prevDataYearIndex][year],...aYearlyDateArr[year]]
    //         //         dataObj[month] = copiedArr;
    //         //       }
    //         //     })
    //         //   }
    //         // });
    //         const prevAndNowConvertedData = makeUpdateData({
    //           yearTableName,
    //           prevYearlyDateArrOnMonthObj,
    //           changeMonthArr,
    //           changedYearlyDateArrOnMonthObj,
    //         });

    //         // 없으면 만들어야 하나?
    //         return client.beforeY22.update({
    //           where: whereLoggedInUser,
    //           data: prevAndNowConvertedData,
    //         });
    //       })
    //       .then(()=>{
    //         // console.log(updateResult)
    //         resolve(1);
    //       })
    //     // 데이터 업데이트. 또 확인하고 해야겠네
    //     // client[key].update
    //   }));
    // }