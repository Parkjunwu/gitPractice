"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paginationErrorCheckNeedLogicAndQueryName_1 = __importDefault(require("../../paginationErrorCheckNeedLogicAndQueryName"));
const user_utils_1 = require("../user.utils");
// const logicGetMyDiaryList: Resolver = async(_,{cursorId},{client,loggedInUser}) => {
const logicGetMyDiaryList = async (_, { cursorId }, { client, logInUserId }) => {
    const take = 20;
    const diaries = await client.diary.findMany({
        where: {
            // userId:loggedInUser.id,
            userId: logInUserId,
        },
        orderBy: [
            {
                dateTime: "desc",
            },
            {
                id: "desc",
            },
        ],
        // orderBy 를 이래 해야 같은 날짜에서도 잘 받아짐. 걍 dateTime 로만 받으면 마지막일떼 prev, next 같은애 받아짐
        // orderBy: {
        //   // id: "desc",
        //   dateTime: "desc",
        // },
        take,
        ...(cursorId && { skip: 1, cursor: { id: cursorId } }),
        select: {
            id: true,
            title: true,
            thumbNail: true,
            // createdAt:true,
            dateTime: true,
            summaryBody: true,
        },
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
const getMyDiaryListFn = async (_, props, ctx) => {
    return (0, paginationErrorCheckNeedLogicAndQueryName_1.default)(await logicGetMyDiaryList(_, props, ctx, null), "getMyDiaryList");
};
const resolver = {
    // GetMyDiaryListResponse:{
    //   isNotFetchMore:() => false,
    // },
    Query: {
        getMyDiaryList: (0, user_utils_1.protectResolver)(getMyDiaryListFn),
    },
};
exports.default = resolver;
