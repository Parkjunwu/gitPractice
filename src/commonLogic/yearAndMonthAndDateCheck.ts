import { getNow } from "../yearCheckList";
import { dateCheckErrorFn } from "./dateCheckError.type";
import yearAndMonthCheck from "./yearAndMonthCheck";

const yearAndMonthAndDateCheck: dateCheckErrorFn = ({year,month,date}) => {

  const { nowYear, nowMonth, nowDate } = getNow();
  // console.log("nowYear  : "+nowYear)
  // console.log("nowMonth  : "+nowMonth)
  // console.log("nowDate  : "+nowDate)
  // console.log("input year  : "+year)
  // console.log("input month  : "+month)
  // console.log("input date  : "+date)

  let error = yearAndMonthCheck({year,month,nowYear,nowMonth});

  // 에러 없는 경우 date 도 검사
  if(!error.formError) {

    if (date > 31 || date === 0) {
      error = {
        formError: true, 
        formErrorType: "wrongApproach",
        which: "date",
      };

    } else if (year === nowYear && date > nowDate) {
      error = {
        formError: true, 
        formErrorType: "getFuture",
        which: "date",
      };
    }

  }

  return error;
};

export default yearAndMonthAndDateCheck;