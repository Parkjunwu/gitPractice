import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";
import { getAndSetUserYtIdArr } from "../diary.utils";

const editOrDeleteYoutubeMusicFn: Resolver = async(_, {id, youtubeId,}:{id:number, youtubeId?:string,}, {client, logInUserId}) => {

  const oldDiary = await client.diary.findFirst({
    where: {
      id,
      userId: logInUserId,
    },
    select: {
      id: true,
    },
  });


  if(!oldDiary) {
    console.error("editOrDeleteYoutubeMusic // try to change not exist / another user's diary. Hacking possibility")
    return { ok:false, error:"존재하지 않는 일기입니다." };
  }

  await client.diary.update({
    where:{
      id
    },
    data:{
      // 안들어온 경우 없앰. undefined 는 아예 인식을 안해서 null 로 넣어야 될듯? 확인해야 함
      youtubeId: youtubeId ?? null,
    },
    select:{
      id:true,
    },
  });

  // youtubeId 있을 때 ytIdArr 에도 없으면 추가
  if(youtubeId){
    await getAndSetUserYtIdArr(client,logInUserId,youtubeId);
  }

  return { ok:true };
};

const resolver: Resolvers = {
  Mutation: {
    editOrDeleteYoutubeMusic: protectResolver(editOrDeleteYoutubeMusicFn),
  },
};

export default resolver;