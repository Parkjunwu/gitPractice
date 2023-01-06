import client from "../../client";
import { Resolvers } from "../../types";
import { getRandomYtIdArr, getThisMonthCalendarData, getTodayDiaries, getTotalUnreadNotification, selectFieldForLogIn } from "../logInUser.util";

const resolver:Resolvers = {
  Query :{
    me: async(_, __, {logInUserId}) => {
      if (!logInUserId) {
        return null;
      }

      const userId = logInUserId;

      const logInUser = await client.user.findUnique({
        where:{
          id: logInUserId,
        },
        select:{
          ...selectFieldForLogIn,
        },
      });
      
      const totalUnreadNotification = getTotalUnreadNotification(userId,logInUser.lastReadNotificationId);
      const todayDiaries = getTodayDiaries(userId);
      // 이번달 일기도 보냄
      const thisMonthData = await getThisMonthCalendarData(userId);

      // const ytIdArr = logInUser.ytIdArr as Prisma.JsonArray;

      // let randomArr: Prisma.JsonArray;

      // if(ytIdArr) {
        
      //   let ytIdArrNumber = ytIdArr.length;

      //   if(ytIdArrNumber > MAX_YT_NUMBER) {
      //     if(ytIdArrNumber < MAX_YT_NUMBER * 2){
      //       // 얘는 미리 다 받고 거기서 몇개를 뺌.
      //       const deleteNumber = ytIdArrNumber - MAX_YT_NUMBER;
      //       for(let i=0;i<deleteNumber;i++){
      //         // 얘는 전체에서 넘치는 갯수만 뺌.
      //         const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
      //         ytIdArr.splice(randomIndex,1);
      //         ytIdArrNumber -= 1;
      //       }
      //       randomArr = ytIdArr;
      //     } else if (ytIdArrNumber < MAX_YT_NUMBER * 4) {
      //       // 얘는 배열에서 하나 빼고 거기서 가져와. 그래서 무조건 MAX_YT_NUMBER번에 끝나는데 대신 할때마다 배열을 수정함. 배열 수정이 아마 걔를 빼고 뒤에놈들을 전부 하나씩 앞으로 옮겼던 거 같은데
      //       randomArr = [];
      //       for(let i=0;i<MAX_YT_NUMBER;i++){
      //         const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
      //         randomArr.push(ytIdArr[randomIndex])
      //         ytIdArr.splice(randomIndex,1);
      //         ytIdArrNumber -= 1;
      //       }
      //     } else {
      //       // 얘는 Set 에 넣음. 중복이 알아서 없어짐. 배열을 수정 안하는 대신 MAX_YT_NUMBER번 이상 걸릴 수 있음.
      //       const mySet = new Set<Prisma.JsonValue>();
      //       for(let i=0;i<MAX_YT_NUMBER;i++){
      //         const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
      //         mySet.add(ytIdArr[randomIndex])
      //       }
      //       do {
      //         if(mySet.size === MAX_YT_NUMBER) break;
      //         const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
      //         mySet.add(ytIdArr[randomIndex])
      //       } while(true);
      //       randomArr = Array.from(mySet);
      //     }
      //   } else {
      //     randomArr = ytIdArr;
      //   }
      // }
      // 타입 안적어도 되네. 일단 이래 써
      const ytIdArr = logInUser.ytIdArr;
      const randomArr = getRandomYtIdArr(ytIdArr);

      return {
        ...logInUser,
        totalUnreadNotification,
        todayDiaries,
        thisMonthData,
        ...(randomArr && { prevYtIdArr:randomArr }),
      };
    },
  },
};

export default resolver;


// const getArr = (ytIdArr:Prisma.JsonArray) => {

//   let randomArr: Prisma.JsonArray;

//   if(ytIdArr) {
//     // const ytIdArrNumber = ytIdArr.length;
//     let ytIdArrNumber = ytIdArr.length;

//     if(ytIdArrNumber > MAX_YT_NUMBER) {
//       if(ytIdArrNumber < MAX_YT_NUMBER * 2){
//         console.log("ytIdArrNumber < MAX_YT_NUMBER * 2 : "+ytIdArrNumber)
//         // 얘는 미리 다 받고 거기서 몇개를 뺌.
//         const deleteNumber = ytIdArrNumber - MAX_YT_NUMBER;
//         for(let i=0;i<deleteNumber;i++){
//           // const nowArrLength = ytIdArr.length;
//           // const randomIndex = Math.floor(Math.random() * nowArrLength);
//           const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
//           ytIdArr.splice(randomIndex,1);
//           ytIdArrNumber -= 1;
//         }
//         randomArr = ytIdArr;
//       } 
//       else if (ytIdArrNumber < MAX_YT_NUMBER * 4) {
//         console.log("ytIdArrNumber < MAX_YT_NUMBER * 4 : "+ytIdArrNumber)
//         // 얘는 배열에서 하나 빼고 거기서 가져와. 그래서 무조건 MAX_YT_NUMBER번에 끝나는데 대신 할때마다 배열을 수정함.
//         // const randomArr = [];
//         randomArr = [];
//         for(let i=0;i<MAX_YT_NUMBER;i++){
//           // const nowArrLength = ytIdArr.length;
//           // const randomIndex = Math.floor(Math.random() * nowArrLength);
//           const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
//           randomArr.push(ytIdArr[randomIndex])
//           ytIdArr.splice(randomIndex,1);
//           ytIdArrNumber -= 1;
//         }
//       } 
//       else {
//         console.log("Set : "+ytIdArrNumber)
//         // 얘는 Set 에 넣음. 중복이 알아서 없어짐. 배열을 수정 안하는 대신 MAX_YT_NUMBER 번 이상 실행할 수 있음.
//         const mySet = new Set<Prisma.JsonValue>();
//         for(let i=0;i<MAX_YT_NUMBER;i++){
//           // const nowArrLength = ytIdArr.length;
//           // const randomIndex = Math.floor(Math.random() * nowArrLength);
//           const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
//           mySet.add(ytIdArr[randomIndex])
//           console.log("for!")
//         }
//         do {
//           console.log("do!")
//           if(mySet.size === MAX_YT_NUMBER) break;
//           // const nowArrLength = ytIdArr.length;
//           // const randomIndex = Math.floor(Math.random() * nowArrLength);
//           const randomIndex = Math.floor(Math.random() * ytIdArrNumber);
//           mySet.add(ytIdArr[randomIndex])
//         } while(true);
//         // const randomArr = Array.from(mySet);
//         randomArr = Array.from(mySet);
//       }
//     } else {
//       randomArr = ytIdArr;
//     }
//   }

//   return randomArr;
// };

// console.log("10개 : "+getArr([1,2,3,4,5,6,7,8,9,10]))
// console.log("19개 : "+getArr([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]))
// console.log("22개 : "+getArr([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]))
// console.log("39개 : "+getArr([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39]))
// console.log("45개 : "+getArr([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]))