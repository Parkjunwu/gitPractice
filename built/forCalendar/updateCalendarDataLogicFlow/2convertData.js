"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertData_logic_1 = require("./convertData.logic");
// JSON 데이터 변경
const convertData = (workType, passingProps) => {
    let updatedDiaryListData;
    switch (workType) {
        case "uploadDiary":
            updatedDiaryListData = (0, convertData_logic_1.uploadDiaryConvertJSON)(passingProps);
            break;
        case "editDiary":
            updatedDiaryListData = (0, convertData_logic_1.editDiaryConvertJSON)(passingProps);
            break;
        case "deleteDiary":
            updatedDiaryListData = (0, convertData_logic_1.deleteDiaryConvertJSON)(passingProps);
            break;
    }
    return updatedDiaryListData;
};
exports.default = convertData;
