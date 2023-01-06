"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserNameOnUser = exports.notGetBlockUsersLogicNeedLoggedInUserId = exports.userCheckResolver = exports.protectResolver = exports.getUser = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
// export const getUser = async (accessToken:string|undefined) => {
// if (!accessToken) return null;
const getUser = async (accessToken) => {
    let id;
    try {
        const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        if (typeof decode === "object") {
            id = decode.id;
        }
    }
    catch (e) {
        console.error("getUser // error is : " + e);
        // throw new AuthenticationError('UNAUTHENTICATED');
        return "invalid access token";
    }
    try {
        const user = await client_1.default.user.findUnique({
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
        }
        else {
            return null;
        }
    }
    catch {
        return null;
    }
};
exports.getUser = getUser;
// 로그인한 상태가 아니면 사용 못함.
const protectResolver = (ourResolver) => (root, arg, context, info) => {
    // if (!context.loggedInUser) {
    if (!context.logInUserId) {
        // 쿼리면 null 반환하고 mutation 이면 response 형식으로 반환
        if (info.operation.operation === "query") {
            return null;
        }
        return { ok: false, error: "Please log in to perform this action" };
    }
    return ourResolver(root, arg, context, info);
};
exports.protectResolver = protectResolver;
// 유저 확인..? 에러 메세지를 다르게 줄 수 있음.
const userCheckResolver = (ourResolver, errorMessage = "That user doesn't exist") => async (root, arg, context, info) => {
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
exports.userCheckResolver = userCheckResolver;
const notGetBlockUsersLogicNeedLoggedInUserId = (logInUserId) => ({
    blockedUsers: {
        none: {
            id: logInUserId,
        },
    },
});
exports.notGetBlockUsersLogicNeedLoggedInUserId = notGetBlockUsersLogicNeedLoggedInUserId;
// checkUserName, editProfile 에서 씀.
const checkUserNameOnUser = async (userName) => {
    const isUser = await client_1.default.user.findUnique({
        where: {
            userName,
        },
        select: {
            id: true,
        },
    });
    return Boolean(isUser);
};
exports.checkUserNameOnUser = checkUserNameOnUser;
