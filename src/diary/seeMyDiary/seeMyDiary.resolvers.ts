import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";

const seeMyDiaryFn: Resolver = async(_,{id},{client,logInUserId}) => {

  const diary = await client.diary.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      body: true,
      file: true,
      userId: true,
      createdAt: true,
      // musicUrl: true,
      // music: true,
      youtubeId: true,
      dateTime: true,
    },
  });

  if(!diary) {
    return { error: "존재하지 않는 일기 입니다." };
  }

  if(diary.userId !== logInUserId) {
    console.error("seeMyDiary // see another user's diary. Hacking possibility");
    // return null;
    return { error: "잘못된 접근입니다." };
  }

  const gettingOption = {
    where: {
      userId:logInUserId,
    },
    select:{
      id:true,
    },
    take:1,
    cursor: {
      id,
    },
    skip:1,
  };

  const prevDiary = await client.diary.findFirst({
    ...gettingOption,
    orderBy: [
      {
        dateTime: "desc",
      },
      {
        id:"desc",
      },
    ],
    // orderBy: {
    //   dateTime: "desc",
    // },
  });

  const nextDiary = await client.diary.findFirst({
    ...gettingOption,
    // orderBy: [
    //   {
    //     dateTime: "asc",
    //   },
    //   {
    //     id:"asc",
    //   },
    // ]
    orderBy: {
      dateTime: "asc",
    },
  });
  // orderBy 를 이래 해야 같은 날짜에서도 잘 받아짐. 걍 dateTime 로만 받으면 마지막일떼 prev, next 같은애 받아짐. asc 가 기본인가보네. 왜지?

  const prevDiaryId = prevDiary?.id;
  const nextDiaryId = nextDiary?.id;

  return { diary, prevDiaryId, nextDiaryId };
};

const resolver: Resolvers = {
  Query: {
    seeMyDiary: protectResolver(seeMyDiaryFn),
  },
};

export default resolver;