"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../../user/user.utils");
const diary_utils_1 = require("../diary.utils");
// import sendEmailToAdminister from "./sendEmailToAdminister";
// const requestSongChangeFn: Resolver = async(_,{id,requestMessage},{client,loggedInUser}) => {
const requestSongChangeFn = async (_, { id, showDiary, requestMessage }, { client, logInUserId }) => {
    if (!showDiary && !requestMessage) {
        console.error("requestSongChange // not showDiary with no requestMessage. Hacking possibility");
        return { ok: false, error: "잘못된 접근입니다." };
    }
    const checkDiary = await client.diary.findUnique({
        where: {
            id,
        },
        select: {
            userId: true,
            // musicUrl:true,
            // music:true,
            youtubeId: true,
            ...(showDiary && {
                title: true,
                body: true,
            }),
        },
    });
    if (!checkDiary) {
        console.error("requestSongChange // request not exist diary. Hacking possibility");
        return { ok: false, error: "존재하지 않는 일기입니다." };
    }
    const { userId, youtubeId, title, body, } = checkDiary;
    // if(checkDiary.userId !== loggedInUser.id) {
    if (userId !== logInUserId) {
        console.error("requestSongChange // request another user's diary. Hacking possibility");
        return { ok: false, error: "잘못된 접근입니다." };
    }
    const sendMailResult = await (0, diary_utils_1.sendRequestEmailToAdminister)({
        diaryId: id,
        queryName: "requestSongChange",
        diaryTitle: title,
        body,
        prevMusicId: youtubeId,
        requestMessage,
    });
    if (sendMailResult) {
        return { ok: true };
    }
    else {
        return { ok: false, error: "변경 요청이 실패하였습니다." };
    }
    // return { ok:sendMailResult };
};
const resolver = {
    Mutation: {
        requestSongChange: (0, user_utils_1.protectResolver)(requestSongChangeFn),
    },
};
exports.default = resolver;
