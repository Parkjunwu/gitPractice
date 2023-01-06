"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDiaryConvertJSON = exports.deleteDiaryConvertJSON = exports.editDiaryConvertJSON = void 0;
const convertData_common_1 = require("./convertData.common");
// JSON 수정. editDiary / deleteDiary / uploadDiary
const editDiaryConvertJSON = ({ prevDiaryListData, convertedMonth, diaryYear, tableName, workTypeData }) => {
    const { monthColumnData, isMonthColumnArray } = (0, convertData_common_1.getMonthColumnDataAndIsMonthColumnArray)(prevDiaryListData, convertedMonth);
    if (!isMonthColumnArray) {
        return (0, convertData_common_1.consoleErrorMayBeLogicFail)("editDiary");
    }
    let updatedDiaryListData;
    // edit 은 id, title 필요
    // title 랑 summaryBody undefined 인지 확인해야함. 
    const id = workTypeData.id;
    const title = workTypeData.title;
    const summaryBody = workTypeData.summaryBody;
    const isSummaryBody = summaryBody !== undefined;
    if (tableName === "beforeY22") {
        // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
        const { yearIndex, checkRight } = (0, convertData_common_1.getYearIndexAndCheckRight)(monthColumnData, diaryYear);
        if (!checkRight) {
            return (0, convertData_common_1.consoleErrorMayBeLogicFail)("editDiary");
        }
        // 변수명 깔끔하게 변경
        const year = diaryYear;
        // 근데 얘는 만약에 !checkRight 면 데이터 추가할까?
        updatedDiaryListData = monthColumnData;
        const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].map((dateData) => {
            const dataId = dateData.id;
            if (dataId !== id)
                return dateData;
            // const newDateData = {...dateData,title};
            const newDateData = {
                ...dateData,
                ...(title && { title }),
                ...(isSummaryBody && { summaryBody }),
            };
            return newDateData;
        });
        updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;
    }
    else {
        // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
        updatedDiaryListData = monthColumnData.map((dateData) => {
            const dataId = dateData.id;
            if (dataId !== id)
                return dateData;
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
exports.editDiaryConvertJSON = editDiaryConvertJSON;
const deleteDiaryConvertJSON = ({ prevDiaryListData, convertedMonth, diaryYear, tableName, workTypeData }) => {
    const { monthColumnData, isMonthColumnArray } = (0, convertData_common_1.getMonthColumnDataAndIsMonthColumnArray)(prevDiaryListData, convertedMonth);
    if (!isMonthColumnArray) {
        return (0, convertData_common_1.consoleErrorMayBeLogicFail)("deleteDiary");
    }
    let updatedDiaryListData;
    // delete 은 id 만
    const id = workTypeData.id;
    if (tableName === "beforeY22") {
        // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
        const { yearIndex, checkRight } = (0, convertData_common_1.getYearIndexAndCheckRight)(monthColumnData, diaryYear);
        if (!checkRight) {
            return (0, convertData_common_1.consoleErrorMayBeLogicFail)("deleteDiary");
        }
        // 변수명 깔끔하게 변경
        const year = diaryYear;
        updatedDiaryListData = monthColumnData;
        const thisDiaryDeletedYearData = updatedDiaryListData[yearIndex][year].filter((dateData) => dateData.id !== id);
        if (thisDiaryDeletedYearData.length === 0) {
            // [ {"2000":[]}, {"2002":[{date~~}]} ] 처럼 해당 년 데이터가 없어진 경우 2000년 같이
            if (updatedDiaryListData.length === 1) {
                // [ {"2000":[]} ] 이렇게만 남으면 아예 그 행을 null 로
                updatedDiaryListData = null;
            }
            else {
                // [ {"2002":[{date~~}]} ]  2000 값을 지움.
                updatedDiaryListData = updatedDiaryListData.filter((yearData) => !yearData[year]);
            }
        }
        else {
            // 그 외 일반적인 경우. [ {"2000":[{date~~}]}, {"2002":[{date~~}]} ]
            updatedDiaryListData[yearIndex][year] = thisDiaryDeletedYearData;
        }
    }
    else {
        // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
        updatedDiaryListData = prevDiaryListData[convertedMonth].filter((dateData) => dateData.id !== id);
        if (updatedDiaryListData.length === 0) {
            // 데이터 없어서 [] 이 되면 걍 null 로
            updatedDiaryListData = null;
        }
    }
    return updatedDiaryListData;
};
exports.deleteDiaryConvertJSON = deleteDiaryConvertJSON;
const uploadDiaryConvertJSON = ({ prevDiaryListData, convertedMonth, diaryYear, tableName, workTypeData }) => {
    const { date, id, title, summaryBody } = workTypeData;
    const addDiaryData = {
        date,
        id,
        title,
        summaryBody,
    };
    let updatedDiaryListData;
    const { monthColumnData, isMonthColumnArray } = (0, convertData_common_1.getMonthColumnDataAndIsMonthColumnArray)(prevDiaryListData, convertedMonth);
    if (tableName === "beforeY22") {
        // beforeY22 는 m1 에 [ { 2010: [{date:~~},{date:~~}] }, { 2012: [{date:~~},{date:~~}] } ] 이런 식으로 저장되있음
        updatedDiaryListData = monthColumnData;
        if (isMonthColumnArray) {
            const { yearIndex, checkRight } = (0, convertData_common_1.getYearIndexAndCheckRight)(monthColumnData, diaryYear);
            if (checkRight) {
                updatedDiaryListData[yearIndex][diaryYear].push(addDiaryData);
            }
            else {
                const addYearData = { [diaryYear]: [addDiaryData] };
                updatedDiaryListData.push(addYearData);
            }
        }
        else {
            updatedDiaryListData = [{ [diaryYear]: [addDiaryData] }];
        }
    }
    else {
        // y22 같은 애들은 m1 에 [{date:~~}, {date:~~}] 이런 식으로 저장되있음
        if (isMonthColumnArray) {
            updatedDiaryListData = [...prevDiaryListData[convertedMonth], addDiaryData];
        }
        else {
            updatedDiaryListData = [addDiaryData];
        }
    }
    return updatedDiaryListData;
};
exports.uploadDiaryConvertJSON = uploadDiaryConvertJSON;
