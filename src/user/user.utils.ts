import * as jwt from "jsonwebtoken";
import client from "../client";
import { Resolver } from "../types";

type getUserType = (accessToken:string) => Promise<number|"invalid access token"|null>

// export const getUser = async (accessToken:string|undefined) => {
  // if (!accessToken) return null;
export const getUser: getUserType = async(accessToken) => {
  
  let id: number;
  try {
    const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    if(typeof decode === "object"){
      id = decode.id;
    }
  } catch (e) {
    console.error("getUser // error is : "+e);
    // throw new AuthenticationError('UNAUTHENTICATED');
    return "invalid access token";
  }
  try {
    const user = await client.user.findUnique({
      where: {
        id,
        // 만약에 다시 유저 데이터를 보낼거면 select 넣어서 받아야 할듯
      },
      select: {
        id: true,
      },
    });
    if (user) {
      // return user;
      // console.log("typeof id : "+typeof id) => number 임.
      return id;
      // return user.id;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

// 로그인한 상태가 아니면 사용 못함.
export const protectResolver =
  (ourResolver: Resolver) => (root, arg, context, info) => {
    // if (!context.loggedInUser) {
    if (!context.logInUserId) {
      // 쿼리면 null 반환하고 mutation 이면 response 형식으로 반환
      if(info.operation.operation === "query") {
        return null;
      }
      return { ok: false, error: "Please log in to perform this action" };
    }
    return ourResolver(root, arg, context, info);
  };

// 유저 확인..? 에러 메세지를 다르게 줄 수 있음.
export const userCheckResolver =
  (ourResolver: Resolver, errorMessage: String = "That user doesn't exist") =>
  async (root, arg, context, info) => {
    const { client } = context;
    const { id } = arg;
    const ok = await client.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!ok) {
      // if(info.operation.operation === "query") return null;
      return { ok: false, error: errorMessage };
    }
    return ourResolver(root, arg, context, info);
  };

export const notGetBlockUsersLogicNeedLoggedInUserId = (logInUserId:number) => ({
  blockedUsers: {
    none: {
      id: logInUserId,
    },
  },
});

// checkUserName, editProfile 에서 씀.
export const checkUserNameOnUser = async(userName:string) => {
  const isUser = await client.user.findUnique({
    where: {
      userName,
    },
    select:{
      id:true,
    },
  });

  return Boolean(isUser);
};