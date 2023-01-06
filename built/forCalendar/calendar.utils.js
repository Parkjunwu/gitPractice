"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateDataForCalendar = exports.getTableName = void 0;
const yearCheckList_1 = require("../yearCheckList");
const getTableName = (year) => {
    const { nowYear, prevYearsOnDataBaseList } = (0, yearCheckList_1.getPrevYearsOnDataBaseListAndNowYear)();
    const isNowOrOnTableYear = year === nowYear || prevYearsOnDataBaseList.includes(year);
    const tableName = isNowOrOnTableYear ? "y" + String(year).substring(2, 4) : "beforeY22";
    return tableName;
};
exports.getTableName = getTableName;
const getDateDataForCalendar = (dateTime) => {
    const diaryYear = Math.floor(dateTime / 10000);
    const diaryEmpty = dateTime - diaryYear * 10000;
    const diaryMonth = Math.floor(diaryEmpty / 100);
    const diaryDate = diaryEmpty - diaryMonth * 100;
    const tableName = getTableName(diaryYear);
    const convertedMonth = "m" + diaryMonth;
    return { diaryYear, tableName, convertedMonth, diaryDate };
};
exports.getDateDataForCalendar = getDateDataForCalendar;
