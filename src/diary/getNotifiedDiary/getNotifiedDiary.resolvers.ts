import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";

const getNotifiedDiaryFn: Resolver = async(_,{diaryId},{client,logInUserId}) => {
  const diary = await client.diary.findUnique({
    where: {
      id:diaryId,
    },
    select: {
      id: true,
      title: true,
      body: true,
      file: true,
      userId: true,
      createdAt: true,
      youtubeId: true,
    },
  });
  
  
  if(!diary) {
    return { error: "해당 게시물이 존재하지 않습니다." };
  } else if (diary.userId !== logInUserId) {
    console.error("getNotifiedDiary // get another user's notification.");
    return { error: "잘못된 접근입니다. 같은 문제가 지속 시 문의 주시면 감사드리겠습니다." };
  } else {
    return { diary };
  }
};

const resolver: Resolvers = {
  Query: {
    getNotifiedDiary: protectResolver(getNotifiedDiaryFn),
  },
};

export default resolver;