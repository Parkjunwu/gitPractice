import { Resolver, Resolvers } from "../../types";
import { checkUserNameOnUser } from "../user.utils";

const resolverFn: Resolver = async (_,{ userName },) => checkUserNameOnUser(userName);

const resolver: Resolvers = {
  Query: {
    checkUserName: resolverFn,
  },
};

export default resolver;
