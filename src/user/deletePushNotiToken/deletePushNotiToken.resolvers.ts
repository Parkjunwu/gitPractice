import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../user.utils";

const deletePushNotiTokenFn: Resolver = async (
  _,
  __,
  { logInUserId, client }
) => {
  await client.user.update({
    where:{
      id:logInUserId,
    },
    data:{
      deviceToken:null,
    },
    select:{
      id:true
    },
  });
  
  return { ok: true };
};

const resolver: Resolvers = {
  Mutation: {
    deletePushNotiToken: protectResolver(deletePushNotiTokenFn),
  },
};

export default resolver;
