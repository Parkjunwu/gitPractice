import { Resolvers } from "../../types";
import sendEmailNeedEmailAndPayload from "../createAccount/sendEmail";

const resolver: Resolvers = {
  Mutation: {
    resendEmail: async (_, { email }, { client }) => {
      
      const isToken = await client.tokenForCreateAccount.findUnique({
        where:{
          email,
        },
      });

      if (!isToken) {
        return {ok:false, error:"잘못된 접근입니다."};
      }

      const { payload } = isToken;

      try {

        sendEmailNeedEmailAndPayload(email,payload);
        return { ok:true };
        
      } catch (e) {
        console.error("resendEmail error : "+e)
        return { ok:false, error:"이메일 전송에 실패하였습니다." };
      }
    },
  },
};

export default resolver;
