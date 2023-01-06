"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yearCheckList_1 = require("../yearCheckList");
const yearAndMonthCheck_1 = __importDefault(require("./yearAndMonthCheck"));
const yearAndMonthAndDateCheck = ({ year, month, date }) => {
    const { nowYear, nowMonth, nowDate } = (0, yearCheckList_1.getNow)();
    // console.log("nowYear  : "+nowYear)
    // console.log("nowMonth  : "+nowMonth)
    // console.log("nowDate  : "+nowDate)
    // console.log("input year  : "+year)
    // console.log("input month  : "+month)
    // console.log("input date  : "+date)
    let error = (0, yearAndMonthCheck_1.default)({ year, month, nowYear, nowMonth });
    // 에러 없는 경우 date 도 검사
    if (!error.formError) {
        if (date > 31 || date === 0) {
            error = {
                formError: true,
                formErrorType: "wrongApproach",
                which: "date",
            };
        }
        else if (year === nowYear && date > nowDate) {
            error = {
                formError: true,
                formErrorType: "getFuture",
                which: "date",
            };
        }
    }
    return error;
};
exports.default = yearAndMonthAndDateCheck;
