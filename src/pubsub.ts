import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

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

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});

export default pubsub;

// 실제 들어갈 애는 같기만 하면 되니까 최대한 작은 데이터를 넣음. number 는 안되네.
// 유저간 메세지
export const NEW_MESSAGE = "1"

// 메세지 읽음
export const READ_MESSAGE = "2"

// 그냥 메세지 받았다는 것만
export const GET_MESSAGE = "3"

// Notification 알림
export const NEW_NOTIFICATION = "4"

