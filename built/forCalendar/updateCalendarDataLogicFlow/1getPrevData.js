"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../client"));
const getPrevData = async (tableName, convertedMonth, userId) => 
// await client.y22.findUnique({
await client_1.default[tableName].findUnique({
    where: {
        userId,
    },
    select: {
        // m1:true,
        [convertedMonth]: true,
    },
});
exports.default = getPrevData;
