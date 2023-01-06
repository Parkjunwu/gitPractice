"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndSetUserYtIdArr = exports.sendRequestEmailToAdminister = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendRequestEmailToAdminister = async ({ diaryId, queryName, diaryTitle = "", body, prevMusicId, requestMessage, }) => {
    const title = `일기 ${diaryId} 음악 변경 요청`;
    // const prevMusicInfo = prevMusic ? `이전 음악<br>
    // - id : ${prevMusic.id}<br>
    // - title : ${prevMusic.title}<br>
    // - author : ${prevMusic.author}<br>
    // `
    // :
    const prevMusicInfo = prevMusicId ? `이전 음악 주소<br>
  https://www.youtube.com/watch?v=${prevMusicId}<br>
  <a href="https://www.youtube.com/watch?v=${prevMusicId}">링크</a><br>
  `
        :
            "이전 음악 : 없음";
    let content = "";
    if (Array.isArray(body)) {
        for (let i = 0; i < body.length; i++) {
            content += body[i] + "<br>";
        }
    }
    try {
        const html = `<div style="font-size:13px;">
        ${title}
      </div>
      ${diaryTitle && `<div style="font-size:13px;">
        <br>다이어리 제목 : ${diaryTitle}<br>
      </div>`}
      ${content && `<div style="font-size:13px;">
        <br>본문 :<br>
        ${content}
      </div>`}
      <div style="font-size:13px;">
        <br>${prevMusicInfo}<br>
      </div>
      <div style="font-size:13px;">
        <br>요청사항 : ${requestMessage ?? "없음"}
      </div>`;
        const transporter = nodemailer_1.default.createTransport({
            service: 'Naver',
            host: 'smtp.naver.com',
            port: 587,
            auth: {
                user: process.env.NAVER_ID,
                pass: process.env.NAVER_PASSWORD,
            }
        });
        // send mail
        await transporter.sendMail({
            from: process.env.NAVER_ID,
            to: process.env.NAVER_ID,
            subject: title,
            html,
        });
        return true;
    }
    catch (e) {
        console.error(`${queryName} // sendRequestEmailToAdminister error : ${e}`);
        return false;
    }
};
exports.sendRequestEmailToAdminister = sendRequestEmailToAdminister;
// editDiary, editOrDeleteYoutubeMusic 에서 씀. uploadDiary 는 totalDiary 도 받아야 해서 그냥 따로 씀
const getAndSetUserYtIdArr = async (client, logInUserId, youtubeId) => {
    const logInUser = await client.user.findUnique({
        where: {
            id: logInUserId,
        },
        select: {
            ytIdArr: true,
        },
    });
    // null 일 때도 잘 됨.
    // const prevYtIdArr = loggedInUser.ytIdArr as Prisma.JsonArray;
    const prevYtIdArr = logInUser.ytIdArr;
    let ytIdArr = undefined;
    if (prevYtIdArr) {
        if (!prevYtIdArr.includes(youtubeId)) {
            ytIdArr = [...prevYtIdArr, youtubeId];
        }
    }
    else {
        ytIdArr = [youtubeId];
    }
    if (ytIdArr) {
        await client.user.update({
            where: {
                // id:loggedInUser.id,
                id: logInUserId,
            },
            data: {
                ytIdArr,
            },
            select: {
                id: true,
            },
        });
    }
};
exports.getAndSetUserYtIdArr = getAndSetUserYtIdArr;
