"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_utils_1 = require("../../user/user.utils");
const diary_utils_1 = require("../diary.utils");
// const editOrDeleteYoutubeMusicFn: Resolver = async(_, {id, youtubeId,}:{id:number, youtubeId?:string,}, {client, loggedInUser}) => {
const editOrDeleteYoutubeMusicFn = async (_, { id, youtubeId, }, { client, logInUserId }) => {
    const oldDiary = await client.diary.findFirst({
        where: {
            id,
            // userId: loggedInUser.id,
            userId: logInUserId,
        },
        select: {
            id: true,
        },
    });
    if (!oldDiary) {
        console.error("editOrDeleteYoutubeMusic // try to change not exist / another user's diary. Hacking possibility");
        return { ok: false, error: "존재하지 않는 일기입니다." };
    }
    await client.diary.update({
        where: {
            id
        },
        data: {
            // 안들어온 경우 없앰. undefined 는 아예 인식을 안해서 null 로 넣어야 될듯? 확인해야 함
            youtubeId: youtubeId ?? null,
        },
        select: {
            id: true,
        },
    });
    // youtubeId 있을 때 ytIdArr 에도 없으면 추가
    if (youtubeId) {
        await (0, diary_utils_1.getAndSetUserYtIdArr)(client, logInUserId, youtubeId);
    }
    return { ok: true };
};
const resolver = {
    Mutation: {
        editOrDeleteYoutubeMusic: (0, user_utils_1.protectResolver)(editOrDeleteYoutubeMusicFn),
    },
};
exports.default = resolver;
