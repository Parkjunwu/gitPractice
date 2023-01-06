"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmailUploadErrorToAdmin = () => {
    try {
        const html = `<div style="font-size:13px;">
        S3 업로드 에러. 한번 그러면 계속 그러니 바로 조치 취해
      </div>`;
        //ses ready
        // const ses = new aws.SES({
        //   apiVersion: "2010-12-01",
        //   region: "ap-northeast-2", //AWS SES Region 수정
        // });
        // create Nodemailer SES transporter 
        // 이 때 process.env에 AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 확인한다.
        const transporter = nodemailer_1.default.createTransport({
            // SES: { ses, aws },
            service: 'Naver',
            host: 'smtp.naver.com',
            port: 587,
            auth: {
                user: process.env.NAVER_ID,
                pass: process.env.NAVER_PASSWORD,
            }
        });
        // send mail
        transporter.sendMail({
            from: process.env.NAVER_ID,
            to: process.env.NAVER_ID,
            subject: "[뮤직다이어리] S3 업로드 에러 알림.",
            html,
        }, (err, info) => {
            if (err) {
                console.error("AWS // sendEmailUploadErrorToAdmin error : " + err);
            }
            // if(info) {
            //   console.log("AWS 의 sendEmailUploadErrorToAdmin info : ");
            //   console.log(info)
            // }
        });
    }
    catch (e) {
        console.error("AWS // sendEmailUploadErrorToAdmin error : " + e);
    }
};
exports.default = sendEmailUploadErrorToAdmin;
