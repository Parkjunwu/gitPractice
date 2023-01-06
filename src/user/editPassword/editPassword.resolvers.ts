const bcrypt = require("bcryptjs");
import { protectResolver } from "../user.utils";
import { Resolver, Resolvers } from "../../types";
import { passwordCheck } from "../createAccount/formCheck";

const resolverFn: Resolver = async (
  _,
  { password },
  { logInUserId, client }
) => {

  if(!passwordCheck(password)) {
    // 프론트에서는 거르는데 백엔드에 형식이 안맞는다? 프론트/백엔드 로직 변경이 아니면 말이 안됨.
    console.error("editPassword // get invalid password. Hacking possible.")
    return { ok: false, error: "비밀번호는 8자 이상의 영어, 숫자, 특수문자의 조합이어야 합니다."};
  }

  const uglyPassword = await bcrypt.hash(password, 10);

  const updatedUser = await client.user.update({
    where: {
      id: logInUserId,
    },
    data: {
      password: uglyPassword,
    },
    select:{
      id: true,
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
    editPassword: protectResolver(resolverFn),
  },
};

export default resolver;
