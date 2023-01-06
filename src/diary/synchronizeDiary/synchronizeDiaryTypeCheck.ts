import { minimumYear } from "../../yearCheckList";

type dateTimeCheckIfOkReturnFormDateElseErrorProps = {
  dateTime: number,
  nowFullDate: number,
  nowYear: number,
  nowMonth: number,
  nowDate: number,
};

const minimumDateTime = minimumYear*10000 + 100; //19700100

export const dateTimeCheckIfOkReturnFormDateElseError = ({
  dateTime,
  nowFullDate,
  nowYear,
  nowMonth,
  nowDate,
}:dateTimeCheckIfOkReturnFormDateElseErrorProps) => {
  
  if(dateTime < minimumDateTime || dateTime > nowFullDate) {
    throw new Error("dateTime range not matched. ");
  }

  const yearMonth = Math.floor(dateTime/100)
  const date = dateTime - yearMonth*100;
  const year = Math.floor(yearMonth/100);
  const month = yearMonth - year*100;
  const yearSimple = year - Math.floor(year/100)*100;

  if (year < minimumYear || year > nowYear) {
    throw new Error("dateTime year not matched. ");
  }
  if (month > 12 || month === 0) {
    throw new Error("dateTime month not matched. ");
  }
  if (date > 31 || date === 0) {
    throw new Error("dateTime date not matched. ");
  } 
  if (year === nowYear && (date > nowDate || month > nowMonth)) {
    throw new Error("dateTime is future. ");
  } 
  return {
    date,
    year,
    month,
    yearSimple,
  }
};