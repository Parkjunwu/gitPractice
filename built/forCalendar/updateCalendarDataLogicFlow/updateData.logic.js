"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDiaryUpdateCalendarData = exports.editAndDeleteUpdateCalendarData = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../../client"));
const editAndDeleteUpdateCalendarData = async ({ tableName, userId, convertedMonth, updatedDiaryListData, }) => await client_2.default[tableName].update({
    where: {
        userId,
    },
    data: {
        // null 말고 Prisma.DbNull 써야 된대.
        [convertedMonth]: updatedDiaryListData ?? client_1.Prisma.DbNull,
    },
    select: {
        id: true,
    },
});
exports.editAndDeleteUpdateCalendarData = editAndDeleteUpdateCalendarData;
const uploadDiaryUpdateCalendarData = async ({ tableName, userId, convertedMonth, updatedDiaryListData, prevDiaryListData, }) => {
    // update 말고 create 도 있어야함. 없는 경우 생성해야돼.
    const dataLogic = (workType) => ({
        data: {
            // m1:updatedDiaryListData,
            [convertedMonth]: updatedDiaryListData,
            ...(workType === "create" && {
                user: {
                    connect: {
                        id: userId,
                    },
                },
            }),
        },
        select: {
            id: true,
        },
    });
    if (!prevDiaryListData) {
        // await client.y22.create({
        await client_2.default[tableName].create({
            ...dataLogic("create"),
        });
    }
    else {
        // await client.y22.update({
        await client_2.default[tableName].update({
            where: {
                userId,
            },
            ...dataLogic("update"),
        });
    }
};
exports.uploadDiaryUpdateCalendarData = uploadDiaryUpdateCalendarData;
