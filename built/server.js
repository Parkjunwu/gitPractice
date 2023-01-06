"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const schema_1 = require("@graphql-tools/schema");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_2 = require("./schema");
const apollo_server_core_1 = require("apollo-server-core");
const user_utils_1 = require("./user/user.utils");
const client_1 = __importDefault(require("./client"));
// import graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.mjs');
// import { default as graphqlUploadExpress } from 'graphql-upload/graphqlUploadExpress.mjs';
// import { graphqlUploadExpress } from "graphql-upload";
const graphqlUploadExpress_js_1 = __importDefault(require("graphql-upload/graphqlUploadExpress.js"));
// import graphqlUploadExpress from "./graphqlUploadExpress.js",
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// const jwt = require("jsonwebtoken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const serviceAccount = process.env.FIREBASE_CREDENTIALS;
// const serviceAccount = "./musicdiary-2648a-firebase-adminsdk-ac3h6-49cc935e65.json";
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount)
});
(async function () {
    const app = (0, express_1.default)();
    app.use((0, morgan_1.default)('tiny'));
    app.use((0, graphqlUploadExpress_js_1.default)());
    // load balancer response
    app.get('/', (req, res) => {
        res.send('hello');
    });
    // refreshtoken 으로 accessToken 재발급
    app.get('/refresh', async (req, res) => {
        try {
            console.log("/refresh 의 refreshtoken");
            console.log(req.header('refreshtoken'));
            // 대문자로 해도 되는데 헤더니까 그냥 소문자로
            const decode = await jsonwebtoken_1.default.verify(req.header('refreshtoken'), process.env.REFRESH_TOKEN_SECRET_KEY);
            let id;
            if (typeof decode === "object" && decode.id) {
                id = decode.id;
            }
            if (!id) {
                return { ok: false, error: "invalid token" };
            }
            // 얘는 access 로 생성. accessToken 만드는 거니까.
            // 유저 확인은 굳이 안해도 될듯?
            const accessToken = await jsonwebtoken_1.default.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30m' });
            // 결과 반환
            res.json(accessToken);
        }
        catch (e) {
            console.error("/refresh error : " + e);
            res.status(406).json({ message: "invalid access" });
        }
    });
    const httpServer = (0, http_1.createServer)(app);
    const schema = (0, schema_1.makeExecutableSchema)({
        typeDefs: schema_2.typeDefs,
        resolvers: schema_2.resolvers,
    });
    // 새로운 subscription 서버
    const wsServer = new ws_1.WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    // subscription 에서 토큰 받아서 context 설정하는 함수
    const getDynamicContext = async (ctx, msg, args) => {
        const accessToken = ctx.connectionParams.accesstoken;
        if (accessToken) {
            // const loggedInUser = await getUser(accessToken);
            // return { loggedInUser };
            const logInUserId = await (0, user_utils_1.getUser)(accessToken);
            return { logInUserId };
        }
        return { logInUserId: null };
    };
    // 얘가 subscription 에서 하는 애
    const serverCleanup = (0, ws_2.useServer)({
        schema,
        context: async (ctx, msg, args) => {
            // const getContext = await getDynamicContext(ctx, msg, args);
            // if(getContext.loggedInUser === "invalid access token") throw new AuthenticationError('bbbbb');
            // return getContext;
            return getDynamicContext(ctx, msg, args);
        },
        onConnect: () => {
            console.log("connect~~");
        },
        onDisconnect() {
            console.log('Disconnected!');
        }
    }, wsServer);
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        context: async (context) => {
            if (context.req) {
                const accessToken = context.req.headers.accesstoken;
                // console.log("context accessToken")
                // console.log(context.req.headers)
                // console.log(context.req.headers.accesstoken)
                // console.log(typeof context.req.headers.accesstoken)
                // undefined + "" 가 "undefined" 가 됨.... 왠지 한참 찾았네
                // const loggedInUser = accessToken ? await getUser(accessToken + "") : null;
                const logInUserId = accessToken ? await (0, user_utils_1.getUser)(accessToken + "") : null;
                // const logInUserId = typeof accessToken === "string" ? await getUser(accessToken) : null; // 근데 위에가 더 잘 읽힘.
                if (logInUserId === "invalid access token")
                    throw new apollo_server_core_1.AuthenticationError('bbbbb');
                return {
                    logInUserId,
                    client: client_1.default,
                };
            }
        },
        // csrfPrevention: true,
        plugins: [
            // Playground, 얘를 production 때 없애야 하나?
            process.env.NODE_ENV === 'production'
                ? (0, apollo_server_core_1.ApolloServerPluginLandingPageDisabled)()
                : (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
            // 뭔진 모르지만 subscription 신버전 필요한거
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });
    await server.start();
    server.applyMiddleware({ app });
    const PORT = process.env.PORT;
    // const NODE_ENV = process.env.NODE_ENV
    // NODE_ENV 지정하면 서버가 안돌아감. 이유는 모르겠음.
    httpServer.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    // console.log("Server is now running on~")
    );
})();
