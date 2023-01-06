import { PrismaClient, User } from "@prisma/client";

type Context = {
  // loggedInUser?: User;
  logInUserId: number | null;
  client: PrismaClient;
};

export type Resolver = (
  root: any,
  args: any,
  // context: { loggedInUser?: User; client: PrismaClient },
  context: Context,
  info: any
) => any;

export type Resolvers = {
  [key: string]: {
    [key: string]: Resolver;
  };
};

type SubscriptionContext = {
  // loggedInUser?: User;
  logInUserId: number | "invalid access token" | null;
  client: PrismaClient;
};

type SubscriptionResolver = (
  root: any,
  args: any,
  context: SubscriptionContext,
  info: any
) => any;

export type SubscriptionResolvers = {
  Subscription: {
    [ key: string ]: {
      subscribe: SubscriptionResolver;
    }
  }
}