"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../../user/user.utils");
// seeDiaryOwn 랑 똑같고 title, createdAt 를 더 받음
// const seeNotifiedMyDiaryFn: Resolver = async(_,{id},{client,loggedInUser}) => {
const seeNotifiedMyDiaryFn = async (_, { id }, { client, logInUserId }) => {
    const diary = await client.diary.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            body: true,
            file: true,
            userId: true,
            title: true,
            createdAt: true,
            dateTime: true,
            // musicUrl: true,
            // music: true,
            youtubeId: true,
        },
    });
    if (!diary) {
        return { error: "존재하지 않는 일기 입니다." };
    }
    // 다른 사람도 볼거면 바꿔
    // if(diary.userId !== loggedInUser.id) {
    if (diary.userId !== logInUserId) {
        console.error("seeNotifiedMyDiary // see another user's diary. Hacking possibility");
        // return null;
        return { error: "잘못된 접근입니다." };
    }
    return { diary };
};
const resolver = {
    Query: {
        seeNotifiedMyDiary: (0, user_utils_1.protectResolver)(seeNotifiedMyDiaryFn),
    },
};
exports.default = resolver;
