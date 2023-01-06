"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yearAndMonthCheck_1 = __importDefault(require("../../commonLogic/yearAndMonthCheck"));
const user_utils_1 = require("../../user/user.utils");
const calendar_utils_1 = require("../calendar.utils");
const convertData_common_1 = require("../updateCalendarDataLogicFlow/convertData.common");
// const getCalendarMonthlyDataFn: Resolver = async(_,{year,month},{client,loggedInUser}) => {
const getCalendarMonthlyDataFn = async (_, { year, month }, { client, logInUserId }) => {
    // year month 형식 체크.
    const { formError, which } = (0, yearAndMonthCheck_1.default)({ year, month });
    if (formError) {
        const errorMessage = which ?
            `get invalid ${which}. Hacking possibility`
            :
                "get previous than minimumYear. Hacking possibility";
        console.error("getCalendarMonthlyData // " + errorMessage);
        return null;
    }
    const tableName = (0, calendar_utils_1.getTableName)(year);
    const convertedMonth = "m" + month;
    // const result = await client.y22.findUnique({
    const result = await client[tableName].findUnique({
        where: {
            // userId:loggedInUser.id,
            userId: logInUserId,
        },
        select: {
            // m2:true,
            [convertedMonth]: true,
        },
    });
    // return result?.m2;
    // const monthlyData = result?.[convertedMonth];
    const { monthColumnData } = (0, convertData_common_1.getMonthColumnDataAndIsMonthColumnArray)(result, convertedMonth);
    if (!monthColumnData || tableName[0] === "y") {
        return monthColumnData;
    }
    else {
        const { yearIndex, checkRight: isData } = (0, convertData_common_1.getYearIndexAndCheckRight)(monthColumnData, year);
        return isData ? monthColumnData[yearIndex][year] : null;
    }
};
const resolver = {
    Query: {
        getCalendarMonthlyData: (0, user_utils_1.protectResolver)(getCalendarMonthlyDataFn),
    },
};
exports.default = resolver;
