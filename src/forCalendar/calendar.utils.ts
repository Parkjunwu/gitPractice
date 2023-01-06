import { getPrevYearsOnDataBaseListAndNowYear } from "../yearCheckList";

const getTableName = (year:number) => {
  const { nowYear, prevYearsOnDataBaseList } = getPrevYearsOnDataBaseListAndNowYear();
  const isNowOrOnTableYear = year === nowYear || prevYearsOnDataBaseList.includes(year);

  const tableName = isNowOrOnTableYear ? "y"+ String(year).substring(2,4) : "beforeY22";

  return tableName;
};

const getDateDataForCalendar = (
  dateTime: number,
) => {

  const diaryYear = Math.floor(dateTime/10000); 
  const diaryEmpty = dateTime - diaryYear*10000;
  const diaryMonth = Math.floor(diaryEmpty/100);
  const diaryDate = diaryEmpty - diaryMonth*100;
  
  const tableName = getTableName(diaryYear);

  const convertedMonth = "m"+diaryMonth;

  return { diaryYear, tableName, convertedMonth, diaryDate };
};

export { getTableName, getDateDataForCalendar };