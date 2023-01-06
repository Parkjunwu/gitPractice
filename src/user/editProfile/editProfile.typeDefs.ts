import { gql } from "apollo-server";

export default gql`
  type Mutation {
    editProfile(
      # realName
      # gender
      # birth
      # blockUsers
      # firstName: String
      # lastName: String
      userName: String
      # email: String
      # password 는 그냥 따로
      # password: String
      # bio: String
      avatar: Upload
      deleteAvatar: Boolean
    ):MutationResponse!
  }
`;
