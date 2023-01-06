"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEW_NOTIFICATION = exports.GET_MESSAGE = exports.READ_MESSAGE = exports.NEW_MESSAGE = void 0;
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const ioredis_1 = __importDefault(require("ioredis"));
const options = {
    host: process.env.REDIS_DOMAIN_NAME,
    port: Number(process.env.PORT_NUMBER),
    retryStrategy: times => {
        return Math.min(times * 50, 2000);
    },
};
// 얘는 Heroku 쓸때
// new Redis(process.env.REDIS_URL);
// const client = new Redis(options) 이렇게 쓰면 안됨. publisher, subscriber 에 new Redis(options) 각각 넣어야함. client 를 두개 다 넣으면 오류
const pubsub = new graphql_redis_subscriptions_1.RedisPubSub({
    publisher: new ioredis_1.default(options),
    subscriber: new ioredis_1.default(options)
});
exports.default = pubsub;
// 실제 들어갈 애는 같기만 하면 되니까 최대한 작은 데이터를 넣음. number 는 안되네.
// 유저간 메세지
exports.NEW_MESSAGE = "1";
// 메세지 읽음
exports.READ_MESSAGE = "2";
// 그냥 메세지 받았다는 것만
exports.GET_MESSAGE = "3";
// Notification 알림
exports.NEW_NOTIFICATION = "4";
