"use strict";
// 프론트엔드랑 로직 똑같이 쓰는 중임.
Object.defineProperty(exports, "__esModule", { value: true });
exports.realNameCheck = exports.birthCheck = exports.userNameCheck = exports.passwordCheck = exports.emailCheck = void 0;
const emailCheck = (email) => {
    const reg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return reg.test(email);
};
exports.emailCheck = emailCheck;
const passwordCheck = (password) => {
    const reg = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*\-\(\)+=])(?=.*[0-9]).{8,25}$/;
    // !/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/.test(password)
    return reg.test(password);
};
exports.passwordCheck = passwordCheck;
const userNameCheck = (userName) => {
    // const reg = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/;
    const reg = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]{1,20}$/g;
    return reg.test(userName);
};
exports.userNameCheck = userNameCheck;
const birthCheck = (birth) => {
    if (!birth)
        return true;
    if (birth?.length !== 8)
        return false;
    const reg = /^[0-9]+$/;
    if (!reg.test(birth))
        return false;
    // 혹시라도 엄청나게 오래 쓰면 얘를 현재 년도에서 -1 이런식으로 계산
    const year = Number(birth.substring(0, 4));
    if (year < 1900 || year > 2022)
        return false;
    const month = Number(birth.substring(4, 6));
    if (month === 0 || month > 12)
        return false;
    // 날은 월따라 달라서.. 나중에 변경?
    const day = Number(birth.substring(6, 8));
    if (day === 0 || day > 31)
        return false;
    return true;
};
exports.birthCheck = birthCheck;
const realNameCheck = (realName) => {
    if (!realName)
        return true;
    // 외국인일수도?
    const regKorean = /^[가-힣]+$/;
    // 영어 + 띄어쓰기 포함
    const regEnglish = /^[a-zA-Z\s]+$/;
    return regKorean.test(realName) || regEnglish.test(realName);
};
exports.realNameCheck = realNameCheck;
