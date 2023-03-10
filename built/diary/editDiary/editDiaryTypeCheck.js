"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJsonIsStringArrayNumberArray = void 0;
const checkJsonIsStringArrayNumberArray = (checkList) => {
    const checkStringArrayList = checkList.string;
    const checkNumberArrayList = checkList.number;
    if (!checkStringArrayList && !checkNumberArrayList) {
        return { formError: false };
    }
    const whichError = checkEachListTypeIfErrorReturnWhichElseNull(checkStringArrayList, "string") ?? checkEachListTypeIfErrorReturnWhichElseNull(checkNumberArrayList, "number");
    if (whichError)
        return { formError: true, which: whichError };
    return { formError: false };
};
exports.checkJsonIsStringArrayNumberArray = checkJsonIsStringArrayNumberArray;
const checkEachListTypeIfErrorReturnWhichElseNull = (checkArrayList, typeName) => {
    for (const key in checkArrayList) {
        const jsonValue = checkArrayList[key];
        if (jsonValue && (!Array.isArray(jsonValue) || jsonValue.findIndex(each => typeof each !== typeName) !== -1)) {
            return key;
        }
    }
    return null;
};
// 뭐가 더 보기 좋을라나
// for (const key in checkStringArrayList) {
//   const jsonValue = checkStringArrayList[key];
//   if (jsonValue && (!Array.isArray(jsonValue) || jsonValue.findIndex(each => typeof each !== "string") !== -1)) {
//     // 에러 있을 시 걔를 return 하고 함수 종료
//     return { formError:true, which:key };
//   }
// }
// for (const key in checkNumberArrayList) {
//   const jsonValue = checkNumberArrayList[key];
//   if (jsonValue && (!Array.isArray(jsonValue) || jsonValue.findIndex(each => typeof each !== "number") !== -1)) {
//     // 에러 있을 시 걔를 return 하고 함수 종료
//     return { formError:true, which:key };
//   }
// }
