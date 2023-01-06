"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yearCheckList_1 = require("../yearCheckList");
const yearAndMonthCheck = ({ year, month, nowYear, nowMonth }) => {
    if (year < yearCheckList_1.minimumYear) {
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
        if (month > nowMonth) {
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
exports.default = yearAndMonthCheck;
