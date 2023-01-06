"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS_1 = require("../../shared/AWS");
const user_utils_1 = require("../user.utils");
// const deleteAccountFn: Resolver = async(_,__,{client,loggedInUser}) => {
const deleteAccountFn = async (_, __, { client, logInUserId }) => {
    // 다이어리 먼저 받고 유저 삭제, 그다음 파일 제거.
    const diaryFiles = await client.diary.findMany({
        where: {
            userId: logInUserId,
        },
        select: {
            file: true,
            // thumbNail:true,
        },
    });
    const user = await client.user.delete({
        where: {
            // id:loggedInUser.id,
            id: logInUserId,
        },
        select: {
            // id:true,
            avatar: true,
        },
    });
    if (diaryFiles) {
        diaryFiles.forEach(fileAndThumbNail => {
            // const { file, thumbNail } = fileAndThumbNail;
            const { file } = fileAndThumbNail;
            if (Array.isArray(file)) {
                file.forEach((fileUrl) => (0, AWS_1.async_deletePhotoS3)(fileUrl)); // async 안해도 될듯.
            }
            // thumbNail && async_deletePhotoS3(thumbNail); // 얘는 어차피 사진이면 file 에 있는 애를 받고 비디오여도 async_deletePhotoS3 에서 같이 삭제해서 상관 없을듯
        });
    }
    // const avatar = loggedInUser.avatar;
    const avatar = user.avatar;
    if (avatar) {
        // async_deletePhotoS3(avatar,"avatar"); // async 안해도 될듯.
        (0, AWS_1.async_deletePhotoS3)(avatar); // async 안해도 될듯.
    }
    return { ok: true };
};
const resolver = {
    Mutation: {
        deleteAccount: (0, user_utils_1.protectResolver)(deleteAccountFn),
    },
};
exports.default = resolver;
