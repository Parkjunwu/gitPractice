"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginationErrorCheckNeedLogicAndQueryName = (executeFn, queryName) => {
    const returnFn = () => {
        try {
            return executeFn;
        }
        catch (e) {
            console.log(`paginationErrorCheckNeedLogicAndQueryName // ${queryName} error is ` + e);
            return { error: "데이터를 받지 못하였습니다. 지속적으로 같은 문제가 발생 시 문의주시면 감사드리겠습니다." };
        }
    };
    return returnFn();
};
exports.default = paginationErrorCheckNeedLogicAndQueryName;
