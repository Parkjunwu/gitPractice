"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_1 = __importDefault(require("../createAccount/sendEmail"));
const resolver = {
    Mutation: {
        resendEmail: async (_, { email }, { client }) => {
            const isToken = await client.tokenForCreateAccount.findUnique({
                where: {
                    email,
                },
            });
            if (!isToken) {
                return { ok: false, error: "잘못된 접근입니다." };
            }
            const { payload } = isToken;
            try {
                (0, sendEmail_1.default)(email, payload);
                return { ok: true };
            }
            catch (e) {
                console.error("resendEmail error : " + e);
                return { ok: false, error: "이메일 전송에 실패하였습니다." };
            }
        },
    },
};
exports.default = resolver;
