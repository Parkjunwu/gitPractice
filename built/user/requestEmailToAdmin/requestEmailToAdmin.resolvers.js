"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const requestEmailToAdminFn = async (_, { text }, 
// { loggedInUser }
{ logInUserId }) => {
    // const userId = loggedInUser?.id;
    const userId = logInUserId;
    const errorResult = { ok: false, error: "fail" };
    try {
        const html = `<div style="font-size:15px;">
        본문 : ${text}
      </div>
      <div style="font-size:13px;">
        ${userId ? "유저 id : " + userId : ""}
      </div>`;
        const adminId = process.env.NAVER_ID;
        const transporter = nodemailer_1.default.createTransport({
            service: 'Naver',
            host: 'smtp.naver.com',
            port: 587,
            auth: {
                user: adminId,
                pass: process.env.NAVER_PASSWORD,
            }
        });
        transporter.sendMail({
            from: adminId,
            to: adminId,
            subject: "일기 유저님의 황송한 어플 관련 문의사항 입니다.",
            html,
        }, (err, info) => {
            if (err) {
                console.error("requestEmailToAdminFn // error : " + err);
                return errorResult;
            }
        });
    }
    catch (e) {
        console.error("requestEmailToAdminFn // error : " + e);
        return errorResult;
    }
    return { ok: true };
};
const resolver = {
    Mutation: {
        // 이걸 로그인한 유저만 쓸 수 있게 할까?
        requestEmailToAdmin: requestEmailToAdminFn,
        // requestEmailToAdmin: protectResolver(requestEmailToAdminFn),
    },
};
exports.default = resolver;
