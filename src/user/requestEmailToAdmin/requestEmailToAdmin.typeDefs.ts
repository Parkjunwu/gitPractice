import { gql } from "apollo-server-express";

// 얘는 메일만 보내는 애라 프론트에서 할 수 잇으면 프론트에서 해도 됨. 서버 끊기고 이랬을 때는 메일 못 보낼 수도 있고.
const resolver = gql`
  type Mutation {
    requestEmailToAdmin(
      text: String!
    ): MutationResponse!
  }
`;
export default resolver;
