"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pushNotificationAndPublish_1 = require("../../pushNotificationAndPublish");
const selectDiarySongFn = async (_, { diaryId, youtubeId, password }, { client }) => {
    if (password !== process.env.ADMINISTRATOR_PASSWORD) {
        console.error("selectDiarySong // Access diary song change. Hacking possibility very hard.");
        return { ok: false, error: "잘못된 접근입니다" };
    }
    const checkDiary = await client.diary.findUnique({
        where: {
            id: diaryId,
        },
        select: {
            youtubeId: true,
        },
    });
    if (!checkDiary) {
        console.error("selectDiarySong // Access not exist diary song change. Hacking possibility.");
        return { ok: false, error: "다이어리 없음." };
    }
    if (checkDiary.youtubeId) {
        return { ok: false, error: "기존에 음악이 있는 일기에 selectDiarySong 씀. 일기 id 맞는지 확인 필요" };
    }
    const updateOkThenReturnUserId = (await client.diary.update({
        where: {
            id: diaryId,
        },
        data: {
            youtubeId,
        },
        select: {
            userId: true,
        },
    })).userId;
    await (0, pushNotificationAndPublish_1.pushNotificationSongSelected)(client, "MUSIC_SELECTED", updateOkThenReturnUserId, diaryId);
    return { ok: true };
};
const resolver = {
    Mutation: {
        selectDiarySong: selectDiarySongFn,
    },
};
exports.default = resolver;
