"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYearIndexAndCheckRight = exports.getMonthColumnDataAndIsMonthColumnArray = exports.consoleErrorMayBeLogicFail = void 0;
const consoleErrorMayBeLogicFail = (workType) => {
    console.error(`updateCalendarData // ${workType} // diary 는 변경 되었는데 캘린더에 해당 데이터가 없음. 로직 오류 있을 수 있음.`);
    return null;
};
exports.consoleErrorMayBeLogicFail = consoleErrorMayBeLogicFail;
const getMonthColumnDataAndIsMonthColumnArray = (prevDiaryListData, convertedMonth) => {
    const monthColumnData = prevDiaryListData?.[convertedMonth];
    const isMonthColumnArray = monthColumnData && Array.isArray(monthColumnData);
    return { monthColumnData, isMonthColumnArray };
};
exports.getMonthColumnDataAndIsMonthColumnArray = getMonthColumnDataAndIsMonthColumnArray;
const getYearIndexAndCheckRight = (monthColumnData, diaryYear) => {
    const yearIndex = monthColumnData.findIndex((yearObject) => Boolean(yearObject[diaryYear]));
    // yearObject[stringCreatedYear] 있으면 true 없으면 false? ex) yearObject.2014 없으면 undefined
    // null/undefined 아니고 -1 아냐(해당 year 가 존재한다)
    const checkRight = yearIndex !== -1;
    return { yearIndex, checkRight };
};
exports.getYearIndexAndCheckRight = getYearIndexAndCheckRight;
