import "dotenv/config";
import morgan from "morgan";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { resolvers, typeDefs } from "./schema";
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageDisabled, AuthenticationError } from "apollo-server-core";
import { getUser } from "./user/user.utils";
import client from "./client";
// import graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.mjs');
// import { default as graphqlUploadExpress } from 'graphql-upload/graphqlUploadExpress.mjs';

// import { graphqlUploadExpress } from "graphql-upload";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
// import graphqlUploadExpress from "./graphqlUploadExpress.js",
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import admin from 'firebase-admin';
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";


const serviceAccount = process.env.FIREBASE_CREDENTIALS;
// const serviceAccount = "./musicdiary-2648a-firebase-adminsdk-ac3h6-49cc935e65.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


(async function () {
  const app = express();
  app.use(morgan('tiny'));
  app.use(graphqlUploadExpress());

  // load balancer response
  app.get('/', (req, res) => {
    res.send('hello');
  });

  // refreshtoken 으로 accessToken 재발급
  app.get('/refresh', async(req, res) => {
    try {
      console.log("/refresh 의 refreshtoken")
      console.log(req.header('refreshtoken'))
      // 대문자로 해도 되는데 헤더니까 그냥 소문자로
      const decode = await jwt.verify(req.header('refreshtoken'), process.env.REFRESH_TOKEN_SECRET_KEY);
      
      let id;
      if(typeof decode === "object" && decode.id) {
        id = decode.id;
      }

      if(!id) {
        return { ok:false, error:"invalid token" };
      }
  
      // 얘는 access 로 생성. accessToken 만드는 거니까.
      // 유저 확인은 굳이 안해도 될듯?
      const accessToken = await jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30m' });

      // 결과 반환
      res.json(accessToken);
    } catch (e) {
      console.error("/refresh error : "+e)
      res.status(406).json({message: "invalid access"});
    }
  });
  

  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  
  // 새로운 subscription 서버
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // subscription 에서 토큰 받아서 context 설정하는 함수
  const getDynamicContext = async (ctx, msg, args) => {
    const accessToken = ctx.connectionParams.accesstoken;
    if (accessToken) {
      // const loggedInUser = await getUser(accessToken);
      // return { loggedInUser };
      const logInUserId = await getUser(accessToken);
      return { logInUserId };
    }
    return { logInUserId: null };
  };

  // 얘가 subscription 에서 하는 애
  const serverCleanup = useServer(
    {
      schema,
      context: async(ctx, msg, args) => {
        // const getContext = await getDynamicContext(ctx, msg, args);
        // if(getContext.loggedInUser === "invalid access token") throw new AuthenticationError('bbbbb');
        // return getContext;
        return getDynamicContext(ctx, msg, args);
      },
      onConnect: () => {
        console.log("connect~~")
      },
      onDisconnect() {
        console.log('Disconnected!');
      }
    },
    wsServer
  );


  const server = new ApolloServer({
    schema,
    context: async (context) => {
      if(context.req){
        const accessToken = context.req.headers.accesstoken;

        // console.log("context accessToken")
        // console.log(context.req.headers)
        // console.log(context.req.headers.accesstoken)
        // console.log(typeof context.req.headers.accesstoken)
        // undefined + "" 가 "undefined" 가 됨.... 왠지 한참 찾았네
        // const loggedInUser = accessToken ? await getUser(accessToken + "") : null;
        const logInUserId = accessToken ? await getUser(accessToken + "") : null;
        // const logInUserId = typeof accessToken === "string" ? await getUser(accessToken) : null; // 근데 위에가 더 잘 읽힘.
        if(logInUserId === "invalid access token") throw new AuthenticationError('bbbbb');
        
        return {
          logInUserId,
          client:client,
        };
      }
    },
    // csrfPrevention: true,
    plugins: [
      // Playground, 얘를 production 때 없애야 하나?
      process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
      // 뭔진 모르지만 subscription 신버전 필요한거
      ApolloServerPluginDrainHttpServer({ httpServer }),
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
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    // console.log("Server is now running on~")
  );
})();