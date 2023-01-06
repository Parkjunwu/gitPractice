import { Prisma } from "@prisma/client";
import client from "../client";
import { getNow } from "../yearCheckList";

// getTodayDiaries, getTotalUnreadNotification 는 user resolver, autoLogin 에서 씀
export const getTodayDiaries = async (userId:number) => {
  const notConvertDate = new Date();
  
  // toISOString 로 쓸라면 이렇게 해야 된대
  const now = new Date(notConvertDate.getTime() - (notConvertDate.getTimezoneOffset() * 60000));
  
  const todayFullDate = Number(now.toISOString().slice(0,10).replace(/-/g,""));
  // const todayFullDate = 20221114
  // 아님 당분간은 todayFullDate = 20221114 로 쓰거나. 지금은 계속 오늘 날짜에 써야함.
  

  // 이건 만약 일기를 오늘 날짜만 쓸 수 있게 만든 경우
  // if(now.getDate() !== lastDiaryTime.getDate() || now.getMonth() !== lastDiaryTime.getMonth() || now.getFullYear() !== lastDiaryTime.getFullYear()) {
  //   return false;
  // } else {
  //   return true;
  // }

  const todayDiaries = await client.diary.findMany({
    where:{
      dateTime:todayFullDate,
      userId,
    },
    select:{
      id:true,
      title:true,
      thumbNail:true,
      body:true, // body 추가
      createdAt:true, // createdAt 추가
    },
  });

  // console.log("getTodayDiaries : "+todayDiaries)

  return todayDiaries;
};

export const getTotalUnreadNotification = (userId:number,lastReadNotificationId:number) => client.notification.count({
  where:{
    subscribeUserId:userId,
    id:{
      gt:lastReadNotificationId,
    },
  },
  // 이게 필요할라나? 근데 기본이 desc 인듯
  // orderBy:{
  //   id: "desc",
  // },
});


export const selectFieldForLogIn = {
  id: true,
  userName: true,
  avatar: true,
  lastReadNotificationId: true,
  totalDiary: true,
  ytIdArr: true,
};


export const getThisMonthCalendarData = async(userId:number) => {
// 이번달 일기도 보냄
  const {nowYear, nowMonth} = getNow()
  const tableName = "y"+ String(nowYear).substring(2,4);
  const convertedMonth = "m" + nowMonth;

  // const result = await client.y22.findUnique({
  const result = await client[tableName].findUnique({
    where:{
      userId,
    },
    select:{
      // m2:true,
      [convertedMonth]:true,
    },
  });

  // return result?.m2;
  const thisMonthData = result?.[convertedMonth];
  return thisMonthData;
};

// const MAX_YT_NUMBER = 10; // 여기서 밖에 안써서 걍 안에 넣음. 아니지 밖에 빼놓는게 낫나? 흠..

// export const getRandomYtIdArr = (ytIdArr) => {
//   // let randomArr: Prisma.JsonArray;
  
//   let randomArr;

//   if(ytIdArr) {
    
//     const MAX_YT_NUMBER = 10;
//     let ytIdArrLength = ytIdArr.length;

//     if(ytIdArrLength > MAX_YT_NUMBER) {

//       const getRandomIndex = () => Math.floor(Math.random() * ytIdArrLength);
//       const removeYtIdOnArrByIndex = (randomIndex:number) => {
//         ytIdArr.splice(randomIndex,1);
//         ytIdArrLength -= 1;
//       }

//       if(ytIdArrLength < MAX_YT_NUMBER * 2){
//         // 얘는 미리 다 받고 거기서 몇개를 뺌.
//         const deleteNumber = ytIdArrLength - MAX_YT_NUMBER;
//         for(let i=0;i<deleteNumber;i++){
//           // 얘는 전체에서 넘치는 갯수만 뺌.
//           // const randomIndex = Math.floor(Math.random() * ytIdArrLength);
//           // ytIdArr.splice(randomIndex,1);
//           // ytIdArrLength -= 1;
//           removeYtIdOnArrByIndex(getRandomIndex());
//         }
//         randomArr = ytIdArr;
//       } else if (ytIdArrLength < MAX_YT_NUMBER * 4) {
//         // 얘는 배열에서 하나 빼고 거기서 가져와. 그래서 무조건 MAX_YT_NUMBER번에 끝나는데 대신 할때마다 배열을 수정함. 배열 수정이 아마 걔를 빼고 뒤에놈들을 전부 하나씩 앞으로 옮겼던 거 같은데
//         randomArr = [];
//         for(let i=0;i<MAX_YT_NUMBER;i++){
//           // const randomIndex = Math.floor(Math.random() * ytIdArrLength);
//           // randomArr.push(ytIdArr[randomIndex])
//           // ytIdArr.splice(randomIndex,1);
//           // ytIdArrLength -= 1;
//           const randomIndex = getRandomIndex();
//           randomArr.push(ytIdArr[randomIndex]);
//           removeYtIdOnArrByIndex(randomIndex);
//         }
//       } else {
//         // 얘는 Set 에 넣음. 중복이 알아서 없어짐. 배열을 수정 안하는 대신 MAX_YT_NUMBER번 이상 걸릴 수 있음.
//         const mySet = new Set<Prisma.JsonValue>();

//         const addRandomYtIdOnSet = () => mySet.add(ytIdArr[getRandomIndex()]);

//         for(let i=0;i<MAX_YT_NUMBER;i++){
//           // const randomIndex = Math.floor(Math.random() * ytIdArrLength);
//           // mySet.add(ytIdArr[randomIndex])
//           addRandomYtIdOnSet();
//         }
//         do {
//           if(mySet.size === MAX_YT_NUMBER) break;
//           // const randomIndex = Math.floor(Math.random() * ytIdArrLength);
//           // mySet.add(ytIdArr[randomIndex])
//           addRandomYtIdOnSet();
//         } while(true);
//         randomArr = Array.from(mySet);
//       }
//     } else {
//       randomArr = ytIdArr;
//     }
//   }

//   return randomArr;
// };

export const getRandomYtIdArr = (ytIdArr) => {
  let randomArr;

  if(ytIdArr) {
    
    const MAX_YT_NUMBER = 10;
    let ytIdArrLength = ytIdArr.length;

    if(ytIdArrLength > MAX_YT_NUMBER) {

      const getRandomIndex = () => Math.floor(Math.random() * ytIdArrLength);
      const removeYtIdOnArrByIndex = (randomIndex:number) => {
        ytIdArr.splice(randomIndex,1);
        ytIdArrLength -= 1;
      };

      if(ytIdArrLength < MAX_YT_NUMBER * 2){
        // 얘는 미리 다 받고 거기서 몇개를 뺌.
        const deleteNumber = ytIdArrLength - MAX_YT_NUMBER;
        for(let i=0;i<deleteNumber;i++){
          // 얘는 전체에서 넘치는 갯수만 뺌.
          removeYtIdOnArrByIndex(getRandomIndex());
        }
        randomArr = ytIdArr;
      } else if (ytIdArrLength < MAX_YT_NUMBER * 4) {
        // 얘는 배열에서 하나 빼고 거기서 가져와. 그래서 무조건 MAX_YT_NUMBER번에 끝나는데 대신 할때마다 배열을 수정함. 배열 수정이 아마 걔를 빼고 뒤에놈들을 전부 하나씩 앞으로 옮겼던 거 같은데
        randomArr = [];
        for(let i=0;i<MAX_YT_NUMBER;i++){
          const randomIndex = getRandomIndex();
          randomArr.push(ytIdArr[randomIndex]);
          removeYtIdOnArrByIndex(randomIndex);
        }
      } else {
        // 얘는 Set 에 넣음. 중복이 알아서 없어짐. 배열을 수정 안하는 대신 MAX_YT_NUMBER번 이상 걸릴 수 있음.
        const mySet = new Set<Prisma.JsonValue>();

        const addRandomYtIdOnSet = () => mySet.add(ytIdArr[getRandomIndex()]);

        for(let i=0;i<MAX_YT_NUMBER;i++){
          addRandomYtIdOnSet();
        }
        do {
          if(mySet.size === MAX_YT_NUMBER) break;
          addRandomYtIdOnSet();
        } while(true);
        randomArr = Array.from(mySet);
      }
    } else {
      randomArr = ytIdArr;
    }
  }

  return randomArr;
};

