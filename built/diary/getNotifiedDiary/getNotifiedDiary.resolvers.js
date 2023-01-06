"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../../user/user.utils");
// const getNotifiedDiaryFn: Resolver = async(_,{diaryId},{client,loggedInUser}) => {
const getNotifiedDiaryFn = async (_, { diaryId }, { client, logInUserId }) => {
    const diary = await client.diary.findUnique({
        where: {
            id: diaryId,
        },
        select: {
            id: true,
            title: true,
            body: true,
            file: true,
            userId: true,
            createdAt: true,
            youtubeId: true,
        },
    });
    if (!diary) {
        return { error: "해당 게시물이 존재하지 않습니다." };
        // } else if (diary.userId !== loggedInUser.id) {
    }
    else if (diary.userId !== logInUserId) {
        console.error("getNotifiedDiary // get another user's notification.");
        return { error: "잘못된 접근입니다. 같은 문제가 지속 시 문의 주시면 감사드리겠습니다." };
    }
    else {
        return { diary };
    }
};
const resolver = {
    Query: {
        getNotifiedDiary: (0, user_utils_1.protectResolver)(getNotifiedDiaryFn),
    },
};
exports.default = resolver;
