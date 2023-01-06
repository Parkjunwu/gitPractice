import { Prisma } from "@prisma/client";
import { consoleErrorMayBeLogicFail, getMonthColumnDataAndIsMonthColumnArray, getYearIndexAndCheckRight } from "./convertData.common";
import { ConvertJSONType, DeleteConvertJSONType,} from "./convertData.type";

// JSON 수정. editDiary / deleteDiary / uploadDiary

const editDiaryConvertJSON: ConvertJSONType = ({
  prevDiaryListData,
  convertedMonth,
  diaryYear,
  tableName,
  workTypeData
}) => {

  const { monthColumnData, isMonthColumnArray } = getMonthColumnDataAndIsMonthColumnArray(prevDiaryListData,convertedMonth);

  if(!isMonthColumnArray) {
    return consoleErrorMayBeLogicFail("editDiary");
  }

  let updatedDiaryListData: Prisma.JsonArray;

  // edit 은 id, title 필요
  // title 랑 summaryBody undefined 인지 확인해야함. 
  const id = workTypeData.id;
  const title = workTypeData.title;
  const summaryBody = workTypeData.summaryBody;
  const isSummaryBody = summaryBody !== undefined;
  
  if(tableName === "beforeY22") {
    // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
    
    const { yearIndex, checkRight } = getYearIndexAndCheckRight(monthColumnData,diaryYear)

    if(!checkRight) {
      return consoleErrorMayBeLogicFail("editDiary");
    }

    // 변수명 깔끔하게 변경
    const year = diaryYear;

    // 근데 얘는 만약에 !checkRight 면 데이터 추가할까?

    updatedDiaryListData = monthColumnData;
  
    const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].map((dateData:{id:number,date:number,title:string})=>{
      const dataId = dateData.id;
      if(dataId !== id) return dateData;
      // const newDateData = {...dateData,title};
      const newDateData = {
        ...dateData,
        ...(title && { title }),
        ...(isSummaryBody && { summaryBody }),
      };
      return newDateData;
    });

    updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;

  } else {
    // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
    updatedDiaryListData = monthColumnData.map((dateData:{id:number,date:number,title:string})=>{
      const dataId = dateData.id;
      if(dataId !== id) return dateData;
      // const newDateData = {...dateData,title};
      const newDateData = {
        ...dateData,
        ...(title && { title }),
        ...(isSummaryBody && { summaryBody }),
      };
      return newDateData;
    });
  }

  return updatedDiaryListData;
};


const deleteDiaryConvertJSON: DeleteConvertJSONType = ({
  prevDiaryListData,
  convertedMonth,
  diaryYear,
  tableName,
  workTypeData
}) => {

  const { monthColumnData, isMonthColumnArray } = getMonthColumnDataAndIsMonthColumnArray(prevDiaryListData,convertedMonth);

  if(!isMonthColumnArray) {
    return consoleErrorMayBeLogicFail("deleteDiary");
  }

  let updatedDiaryListData: Prisma.JsonArray;

  // delete 은 id 만
  const id = workTypeData.id;
  
  if(tableName === "beforeY22") {
    // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
    
    const {yearIndex,checkRight} = getYearIndexAndCheckRight(monthColumnData,diaryYear)

    if(!checkRight) {
      return consoleErrorMayBeLogicFail("deleteDiary");
    }

    // 변수명 깔끔하게 변경
    const year = diaryYear;

    updatedDiaryListData = monthColumnData;

    const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].filter((dateData:{id:number,date:number,title:string})=>dateData.id !== id);
      
    if(thisDiaryDeletedYearData.length === 0) {
      // [ {"2000":[]}, {"2002":[{date~~}]} ] 처럼 해당 년 데이터가 없어진 경우 2000년 같이
      if(updatedDiaryListData.length === 1) {
        // [ {"2000":[]} ] 이렇게만 남으면 아예 그 행을 null 로
        updatedDiaryListData = null;
      } else {
        // [ {"2002":[{date~~}]} ]  2000 값을 지움.
        updatedDiaryListData = updatedDiaryListData.filter((yearData:{[key:string]:any})=>!yearData[year]);
      }
    } else {
      // 그 외 일반적인 경우. [ {"2000":[{date~~}]}, {"2002":[{date~~}]} ]
      updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;
    }

  } else {
    // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
    updatedDiaryListData = prevDiaryListData[convertedMonth].filter((dateData:{id:number,date:number,title:string})=>dateData.id !== id);

    if(updatedDiaryListData.length === 0) {
      // 데이터 없어서 [] 이 되면 걍 null 로
      updatedDiaryListData = null;
    }
  }

  return updatedDiaryListData;
};


const uploadDiaryConvertJSON: ConvertJSONType = ({
  prevDiaryListData,
  convertedMonth,
  diaryYear,
  tableName,
  workTypeData
}) => {

  const { date, id, title, summaryBody } = workTypeData;

  const addDiaryData = {
    date,
    id,
    title,
    summaryBody,
  };
  
  let updatedDiaryListData: Prisma.JsonArray;
  
  const { monthColumnData, isMonthColumnArray } = getMonthColumnDataAndIsMonthColumnArray(prevDiaryListData,convertedMonth);

  if(tableName === "beforeY22") {
    // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
    updatedDiaryListData = monthColumnData;

    if(isMonthColumnArray) {

      const { yearIndex, checkRight } = getYearIndexAndCheckRight(monthColumnData,diaryYear);

      if(checkRight) {

        updatedDiaryListData[yearIndex][diaryYear].push(addDiaryData);
      } else {
        const addYearData = {[diaryYear] : [addDiaryData]};

        updatedDiaryListData.push(addYearData);
      }
    } else {
      
      updatedDiaryListData = [ {[diaryYear] : [addDiaryData]} ];

    }

  } else {
    // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
    if(isMonthColumnArray) {
      updatedDiaryListData = [ ...prevDiaryListData[convertedMonth], addDiaryData ];
    } else {
      updatedDiaryListData = [ addDiaryData ];
    }
  }

  return updatedDiaryListData;
};


export { editDiaryConvertJSON, deleteDiaryConvertJSON, uploadDiaryConvertJSON };