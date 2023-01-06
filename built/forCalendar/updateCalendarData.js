"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const calendar_utils_1 = require("./calendar.utils");
const _1getPrevData_1 = __importDefault(require("./updateCalendarDataLogicFlow/1getPrevData"));
const _2convertData_1 = __importDefault(require("./updateCalendarDataLogicFlow/2convertData"));
const _3updateData_1 = __importDefault(require("./updateCalendarDataLogicFlow/3updateData"));
const updateCalendarData = async (workTypeAndNeededData, dateTime, userId) => {
    // 유형 확인
    // let workType: "uploadDiary"|"editDiary"|"deleteDiary";
    let workType;
    let workTypeData;
    // DB 관련 필요한 정보 가져옴.
    const { diaryYear, tableName, convertedMonth, diaryDate } = (0, calendar_utils_1.getDateDataForCalendar)(dateTime);
    if (workTypeAndNeededData.deleteDiary) {
        workType = "deleteDiary";
        workTypeData = workTypeAndNeededData.deleteDiary;
    }
    else if (workTypeAndNeededData.editDiary) {
        workType = "editDiary";
        workTypeData = workTypeAndNeededData.editDiary;
    }
    else if (workTypeAndNeededData.uploadDiary) {
        workType = "uploadDiary";
        workTypeData = {
            ...workTypeAndNeededData.uploadDiary,
            // dateTime,
            date: diaryDate,
        };
    }
    if (!workType)
        return console.error("updateCalendarData 에 workTypeAndNeededData 인수 잘못 들어옴.");
    // if(!workType) return console.error("updateCalendarData // invalid workTypeAndNeededData params.");
    // 데이터 조회
    const prevDiaryListData = await (0, _1getPrevData_1.default)(tableName, convertedMonth, userId);
    // JSON 데이터 변경
    const passingProps = {
        prevDiaryListData,
        convertedMonth,
        diaryYear,
        tableName,
        workTypeData,
    };
    const updatedDiaryListData = (0, _2convertData_1.default)(workType, passingProps);
    // 데이터 업데이트
    const passingPropsForUpdate = {
        tableName,
        userId,
        convertedMonth,
        updatedDiaryListData,
        prevDiaryListData, // 얘는 upload 에만 필요하지만 계산하면 보기 불편해져서 걍 다 넣음
    };
    await (0, _3updateData_1.default)(workType, passingPropsForUpdate);
};
exports.default = updateCalendarData;
