import nodemailer from "nodemailer";
// import * as aws from "@aws-sdk/client-ses";

const sendEmailNeedEmailAndPayload = (email,payload) => {
  try {
    const url = `https://so-cutie.netlify.app/confirm/${payload}/${email}`;

    const html = `<div style="font-size:13px;">
        회원가입 해주셔서 감사합니다.
      </div>
      <div style="font-size:13px;">
        해당 메일은 ${email}이 정확한 이메일 주소인지 확인하는 메일입니다.
      </div>
      <div style="font-size:13px;">
        이메일 인증을 위해 URL을 클릭해주세요.
      </div>
      <a href=${url} target='_blank'>
        인증하기
      </a>`;

    //ses ready
    // const ses = new aws.SES({
    //   apiVersion: "2010-12-01",
    //   region: "ap-northeast-2", //AWS SES Region 수정
    // });
      // create Nodemailer SES transporter 
      // 이 때 process.env에 AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 확인한다.
    const transporter = nodemailer.createTransport({ 
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
    transporter.sendMail(
      {
        from: process.env.NAVER_ID,
        to: email,
        subject: "[뮤직다이어리] 회원가입 인증메일 입니다.",
        html,
      },
      (err, info) => {
        if (err) {
          console.error("createAccount // sendEmail error : "+err);
        }
        // if(info) {
        //   console.log("createAccount // sendEmail info : ");
        //   console.log(info)
        // }
      }
    );
  } catch (e) {
    console.error("createAccount // sendEmailNeedEmailAndPayload error : "+e);
  }
};

export default sendEmailNeedEmailAndPayload;