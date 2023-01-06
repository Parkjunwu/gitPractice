"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateData_logic_1 = require("./updateData.logic");
const updateData = async (workType, passingPropsForUpdate) => {
    const isUpload = workType === "uploadDiary";
    if (isUpload) {
        await (0, updateData_logic_1.uploadDiaryUpdateCalendarData)(passingPropsForUpdate);
    }
    else {
        await (0, updateData_logic_1.editAndDeleteUpdateCalendarData)(passingPropsForUpdate);
    }
};
exports.default = updateData;
