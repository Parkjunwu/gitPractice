import { checkUserNameOnUser, protectResolver } from "../user.utils";
import { Resolver, Resolvers } from "../../types";
import { userNameCheck } from "../createAccount/formCheck";
import { async_deletePhotoS3, async_uploadPhotoS3 } from "../../shared/AWS";

const resolverFn: Resolver = async (
  _,
  // { firstName, lastName, userName, email, password, bio, avatar },
  { userName, avatar, deleteAvatar },
  { logInUserId, client }
) => {

  // if(!firstName && !lastName && !userName && !email && !password && !bio && !avatar) {
  if(!userName && !avatar && !deleteAvatar) {
    return { ok: true };
  }

  // if(userName && !userNameCheck(userName)) {
  //   // 프론트에서는 거르는데 백엔드에 형식이 안맞는다? 프론트/백엔드 로직 변경이 아니면 말이 안됨.
  //   console.error("editProfile 이상한 값 들어옴. 해킹 가능성 있음.")
  //   return { ok: false, error: "닉네임에는 20자 이하의 영어, 한글, 숫자만 사용 가능합니다."};
  // }
  if(userName) {
    // 프론트에서는 거르는데 백엔드에 형식이 안맞는다? 프론트/백엔드 로직 변경이 아니면 말이 안됨.
    if( !userNameCheck(userName) ) {
      console.error("editProfile // get invalid userName. Hacking possibility.")
      return { ok: false, error: "닉네임에는 20자 이하의 영어, 한글, 숫자만 사용 가능합니다."};
    }
    if(await checkUserNameOnUser(userName)) {
      return { ok: false, error: "이미 존재하는 유저명 입니다."};
    }
  }

  // if(password && !passwordCheck(password)) {
  //   // 프론트에서는 거르는데 백엔드에 형식이 안맞는다? 프론트/백엔드 로직 변경이 아니면 말이 안됨.
  //   console.error("editProfile 이상한 값 들어옴. 해킹 가능성 있음.")
  //   return { ok: false, error: "비밀번호는 8자 이상의 영어, 숫자, 특수문자의 조합이어야 합니다."};
  // }

  // let uglyPassword = null;

  // if (password) {
  //   uglyPassword = await bcrypt.hash(password, 10);
  // }

  if(deleteAvatar){
    const { avatar:prevAvatar } = await client.user.findUnique({
      where:{
        id:logInUserId,
      },
      select:{
        avatar:true,
      },
    });

    if(!prevAvatar) {
      console.error("editProfile // no avatar but get delete. Hacking possibility.");
      return { ok: false, error: "프로필 변경이 실패하였습니다. 지속적으로 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
    } else {
      // await async_deletePhotoS3(prevAvatar,"avatar");
      await async_deletePhotoS3(prevAvatar);
    }
  }

  let avatarUrl: string;
  if (avatar) {
    const dateForUnique = Date.now();
    avatarUrl = await async_uploadPhotoS3(avatar, logInUserId, dateForUnique, "avatar");
  }

  let avatarInput: undefined|string|null = undefined;

  if(avatarUrl) {
    avatarInput = avatarUrl
  } else if(deleteAvatar) {
    avatarInput = null;
  }

  const updatedUser = await client.user.update({
    where: {
      id: logInUserId,
    },
    data: {
      ...(userName && {userName}),
      // ...(uglyPassword && { password: uglyPassword }),
      // ...(avatarUrl && { avatar: avatarUrl }),
      ...(avatarInput !== undefined && { avatar: avatarInput }),
    },
    select:{
      id:true,
    },
  });

  if (updatedUser.id) {
    return { ok: true };
  } else {
    return { ok: false, error: "프로필 변경이 실패하였습니다. 지속적으로 같은 문제 발생 시 문의 주시면 감사드리겠습니다." };
  }
};

const resolver: Resolvers = {
  Mutation: {
    editProfile: protectResolver(resolverFn),
  },
};

export default resolver;
