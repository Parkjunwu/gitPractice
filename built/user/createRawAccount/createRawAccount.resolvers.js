"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const resolverFn = {
    Mutation: {
        createRawAccount: async (_, { email, password, userName, }, { client }) => {
            try {
                const checkingEmailLogic = {
                    where: {
                        email,
                    },
                    select: {
                        id: true
                    }
                };
                const checkEmailOnUser = await client.user.findUnique(checkingEmailLogic);
                if (checkEmailOnUser) {
                    return {
                        ok: false,
                        errorCode: "EMAIL",
                    };
                }
                const checkEmailOnToken = await client.tokenForCreateAccount.findUnique(checkingEmailLogic);
                if (checkEmailOnToken) {
                    return {
                        ok: false,
                        errorCode: "ALREADY_TOKEN",
                    };
                }
                const checkingUserNameLogic = {
                    where: {
                        userName,
                    },
                    select: {
                        id: true,
                    }
                };
                const checkUserNameOnUser = await client.user.findUnique(checkingUserNameLogic);
                const checkUserNameOnToken = await client.tokenForCreateAccount.findUnique(checkingUserNameLogic);
                if (checkUserNameOnUser || checkUserNameOnToken) {
                    return {
                        ok: false,
                        errorCode: "USERNAME",
                    };
                }
                const uglyPassword = await bcrypt.hash(password, 10);
                await client.user.create({
                    data: {
                        userName,
                        email,
                        password: uglyPassword,
                    },
                    select: {
                        id: true,
                    }
                });
                return { ok: true };
            }
            catch (e) {
                console.error("createRawAccount // error is : " + e);
                return {
                    ok: false,
                    errorCode: "UNKNOWN",
                };
            }
        },
    },
};
exports.default = resolverFn;
