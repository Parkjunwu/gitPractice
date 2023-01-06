"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paginationErrorCheckNeedLogicAndQueryName_1 = __importDefault(require("../../paginationErrorCheckNeedLogicAndQueryName"));
const user_utils_1 = require("../../user/user.utils");
// import { notGetBlockUsersLogicNeedLoggedInUserId } from "../../user/user.utils";
// const logicSearchMyDiaries: Resolver = async(_,{keyword,cursorId},{client,loggedInUser}) => {
const logicSearchMyDiaries = async (_, { keyword, cursorId }, { client, logInUserId }) => {
    const take = 20;
    const diaries = await client.diary.findMany({
        where: {
            // userId:loggedInUser.id,
            userId: logInUserId,
            title: {
                contains: keyword,
            },
            // body 가 JSON 이야. 여기서도 찾을라면,, 흠...
            // body:
        },
        select: {
            id: true,
            title: true,
            // createdAt:true,
            thumbNail: true,
            dateTime: true,
        },
        orderBy: {
            // id: "desc",
            dateTime: "desc",
        },
        // orderBy: [
        //   {
        //     dateTime: "desc",
        //   },
        //   {
        //     createdAt:"desc",
        //   },
        // ],
        take,
        ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
    });
    const diariesCount = diaries.length;
    // 메세지 받은 개수가 한번에 가져올 갯수랑 달라. 그럼 마지막이라는 뜻. 다만 딱 한번에 가져올 갯수랑 맞아 떨어지면 다음에 가져올 게 없지만 그래도 있는 걸로 나옴.
    const isHaveHaveNextPage = diariesCount === take;
    if (isHaveHaveNextPage) {
        const cursorId = diaries[diariesCount - 1].id;
        return {
            cursorId,
            hasNextPage: true,
            diaries,
        };
    }
    else {
        return {
            hasNextPage: false,
            diaries,
        };
    }
};
const searchMyDiariesFn = async (_, props, ctx) => {
    return (0, paginationErrorCheckNeedLogicAndQueryName_1.default)(await logicSearchMyDiaries(_, props, ctx, null), "searchMyDiaries");
};
const resolver = {
    Query: {
        searchMyDiaries: (0, user_utils_1.protectResolver)(searchMyDiariesFn),
    },
};
exports.default = resolver;
