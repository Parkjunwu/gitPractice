import { dateCheckErrorType } from "../../commonLogic/dateCheckError.type";
import yearAndMonthAndDateCheck from "../../commonLogic/yearAndMonthAndDateCheck";
import { minimumYear } from "../../yearCheckList";

// const returnErrorWrongApproach = (which:"dateTime"|"month"|"date"|"body") => {
const returnErrorWrongApproach = (which:string) => {
  console.error(`uploadDiary // returnErrorWrongApproach // get invalid ${which}. Hacking possibility`);
  return { ok:false, error:"잘못된 형식입니다." };
};

const returnErrorGetTooPast = () => {
  console.error(`uploadDiary // returnErrorGetTooPast // get previous than minimumYear . Hacking possibility`);
  return { ok:false, error:`${minimumYear}년 이전의 일기를 쓸 수 없습니다.` };
};

// const returnErrorGetFuture = (which:"year"|"month"|"date") => {
const returnErrorGetFuture = (which:string) => {
  console.error(`uploadDiary // returnErrorGetFuture // get future than today. which:${which} Hacking possibility`);
  return { ok:false, error:"오늘 이후의 일기를 쓸 수 없습니다." };
};


type FormErrorType = "getTooPast" | "getFuture" | "wrongApproach"

const returnMatchedErrorAndConsoleError = (formErrorType:FormErrorType,which?:string) => {
  if(formErrorType === "wrongApproach") {
    return returnErrorWrongApproach(which);
  } else if(formErrorType === "getFuture") {
    return returnErrorGetFuture(which);
  } else if(formErrorType === "getTooPast") {
    return returnErrorGetTooPast();
  }
}



type uploadDiaryTypeCheckType = (
  dateTime:string,
  // body:any
  summaryBody?:string,
) => dateCheckErrorType

// 형식 체크
const uploadDiaryTypeCheck: uploadDiaryTypeCheckType = (dateTime,summaryBody) => {
  if(isNaN(+dateTime) || dateTime.length !== 8) {
    // return returnErrorWrongApproach("dateTime");
    return {
      formError: true, 
      formErrorType: "wrongApproach",
      which: "dateTime",
    };
  }

  // const stringCreatedYear = dateTime.substring(0,4);
  // const createdYear = +stringCreatedYear;
  const createdYear = +dateTime.substring(0,4);
  const createdMonth = +dateTime.substring(4,6); 
  const createdDate = +dateTime.substring(6,8);

  // if (createdYear < minimumYear) {
  //   // return returnErrorGetTooPast()
  //   return {
  //     formError: true, 
  //     formErrorType: "getTooPast",
  //     // which: ,
  //   };
  // }
  // if (createdYear > nowYear) {
  //   // return returnErrorGetFuture("year");
  //   return {
  //     formError: true, 
  //     formErrorType: "getFuture",
  //     which: "year",
  //   };
  // }
  // if (createdMonth > 12 || createdMonth === 0) {
  //   // return returnErrorWrongApproach("month");
  //   return {
  //     formError: true, 
  //     formErrorType: "wrongApproach",
  //     which: "month",
  //   };
  // }
  // if (createdDate > 31 || createdDate === 0) {
  //   // return returnErrorWrongApproach("date");
  //   return {
  //     formError: true, 
  //     formErrorType: "wrongApproach",
  //     which: "date",
  //   };
  // }
  // if (createdYear === nowYear) {
  //   if(createdMonth > nowMonth) {
  //     // return returnErrorGetFuture("month");
  //     return {
  //       formError: true, 
  //       formErrorType: "getFuture",
  //       which: "month",
  //     };
  //   } else if (createdDate > nowDate) {
  //     // return returnErrorGetFuture("date");
  //     return {
  //       formError: true, 
  //       formErrorType: "getFuture",
  //       which: "date",
  //     };
  //   }
  // } 
  const dateErrorCheck = yearAndMonthAndDateCheck({
    year:createdYear,
    month:createdMonth,
    date:createdDate,
  });

  if(dateErrorCheck.formError) return dateErrorCheck;

  // if(!Array.isArray(body) || body.findIndex(each => typeof each !== "string") !== -1 || body.length === 0) {
  if(summaryBody && summaryBody.length > 40) {
    // return returnErrorWrongApproach("body");
    return {
      formError: true, 
      formErrorType: "wrongApproach",
      which: "summaryBody",
    };
  }

  return { formError: false };

};


export {
  // returnErrorWrongApproach,
  // returnErrorGetTooPast,
  // returnErrorGetFuture,
  returnMatchedErrorAndConsoleError,
  uploadDiaryTypeCheck
};
