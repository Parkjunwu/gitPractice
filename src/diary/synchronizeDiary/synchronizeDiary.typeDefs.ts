import { gql } from "apollo-server-express";

export default gql`
  # 이거 될라나? 안되면 JSON 으로 하고
  input diaryFormat {
    title: String!,
    body: String!,
    # dateTime: String!,
    # 걍 Int 로 받을까?
    dateTime: Int!,
    youtubeId: String,
  }
  # type SynchronizeDiaryResponse {
  #   ok:Boolean!,
  #   error:String,
  #   # uploadedDiary:[Diary]
  # }
  type Mutation {
    synchronizeDiary(
      uploadDiaries:[diaryFormat]!
    ): MutationResponse!
  }
`;