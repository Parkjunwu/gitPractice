import { minimumYear } from "../yearCheckList";
import { dateCheckErrorFn } from "./dateCheckError.type";

const yearAndMonthCheck: dateCheckErrorFn = ({year,month,nowYear,nowMonth}) => {

  if (year < minimumYear) {
    // return returnErrorGetTooPast()
    return {
      formError: true, 
      formErrorType: "getTooPast",
      // which: ,
    };
  }
  if (year > nowYear) {
    // return returnErrorGetFuture("year");
    return {
      formError: true, 
      formErrorType: "getFuture",
      which: "year",
    };
  }
  if (month > 12 || month === 0) {
    // return returnErrorWrongApproach("month");
    return {
      formError: true, 
      formErrorType: "wrongApproach",
      which: "month",
    };
  }
  if (year === nowYear) {
    if(month > nowMonth) {
      // return returnErrorGetFuture("month");
      return {
        formError: true, 
        formErrorType: "getFuture",
        which: "month",
      };
    } 
  }

  return { formError: false };
};

export default yearAndMonthCheck;