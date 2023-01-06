import { Resolvers } from "../../types";
import { emailCheck, passwordCheck, userNameCheck } from "./formCheck";
import sendEmailNeedEmailAndPayload from "./sendEmail";
const bcrypt = require("bcryptjs");

const resolverFn: Resolvers = {
  Mutation: {
    createAccount: async (
      _,
      { email, password, userName },
      { client }
    ) => {
      if(!emailCheck(email) || !passwordCheck(password) || !userNameCheck(userName)) {
        // 프론트에서는 거르는데 백엔드에 형식이 안맞는다? 프론트/백엔드 로직 변경이 아니면 말이 안됨.
        console.error("createAccount // get invalid input. Hacking possibility.")
        return {
          ok: false,
          errorCode: "INVALID_INPUT",
        }
      }
      try {
        const checkingEmailLogic = {
          where: {
            email,
          },
          select:{
            id:true
          }
        };

        const checkEmailOnUser = await client.user.findUnique(checkingEmailLogic);
        
        if (checkEmailOnUser) {
          return {
            ok: false,
            errorCode: "EMAIL",
          };
        }

        const checkEmailOnToken = await client.tokenForCreateAccount.findUnique(checkingEmailLogic);

        if (checkEmailOnToken) {
          return {
            ok: false,
            errorCode: "ALREADY_TOKEN",
          };
        }

        const checkingUserNameLogic = {
          where: {
            userName,
          },
          select:{
            id:true
          }
        };
        
        const checkUserNameOnUser = await client.user.findUnique(checkingUserNameLogic);
        const checkUserNameOnToken = await client.tokenForCreateAccount.findUnique(checkingUserNameLogic);
        
        if (checkUserNameOnUser || checkUserNameOnToken) {
          return {
            ok: false,
            errorCode: "USERNAME",
          };
        }
        
        const uglyPassword = await bcrypt.hash(password, 10);

        // token 생성
        const max = 9999999999;
        const min = 1000000000;
        const payload = Math.floor(Math.random()*(max-min+1)) + min + "";

        const createToken = await client.tokenForCreateAccount.create({
          data: {
            payload,
            userName,
            email,
            password: uglyPassword,
          },
          select:{
            id:true,
          }
        });
        
        // 이메일 전송
        sendEmailNeedEmailAndPayload(email,payload);

        // 30분 후에 인증 안됐을 시 토큰 삭제
        setTimeout(async()=>{
          // console.log("유저 생성 30분 후");
          const isUserNotVerify = await client.tokenForCreateAccount.findUnique({
            where:{
              id:createToken.id,
            },
            select:{
              id:true,
            },
          });
          if(isUserNotVerify) {
            await client.tokenForCreateAccount.delete({
              where:{
                id:createToken.id,
              },
            });
            console.log("create Account delete done!");
          }
        },1800000);


        return { ok: true };

      } catch (e) {
        console.error("createAccount // error : "+e)
        return {
          ok: false,
          errorCode: "UNKNOWN",
        };
      }
    },
  },
};

export default resolverFn;
