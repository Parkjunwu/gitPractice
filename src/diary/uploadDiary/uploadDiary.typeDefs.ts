import { gql } from "apollo-server-express";

export default gql`
  # 업로드 타입 정의
  scalar Upload
  # 결과를 완료 + Diary 로 해야 할듯
  type UploadDiaryResponse {
    ok:Boolean!,
    error:String,
    uploadedDiary:Diary
  }
  type Mutation {
    uploadDiary(
      title:String!,
      fileArr:[Upload!]!, # 뒤에 ! 있음
      body:[String!]!,
      # body:JSON!,
      # thumbNail:Upload,

      thumbNailArr:[Upload!], # 뒤에 ! 없음 # 비디오 빼서 지금 안씀.

      isFirstVideo:Boolean!, # 추가함
      # firstVideoPhoto:Upload,
      dateTime:String!,

      youtubeId:String,
      requestMusic:Boolean!
      showDiary:Boolean,
      requestMessage:String,
      # requestMessage:String,
      summaryBody:String,
    ): UploadDiaryResponse!
  }
`;


// // 동영상 하나로 바꾼 후
// import { gql } from "apollo-server-express";

// export default gql`
//   # 업로드 타입 정의
//   scalar Upload
//   # 결과를 완료 + Diary 로 해야 할듯
//   type UploadDiaryResponse {
//     ok:Boolean!,
//     error:String,
//     uploadedDiary:Diary
//   }
//   type Mutation {
//     uploadDiary(
//       title: String!,
//       fileArr: [Upload!]!, # 뒤에 ! 있음
//       videoFile: Upload, # video 추가
//       videoIndex: Int, # video 추가
//       videoThumbNail: Upload, # video 추가
//       # thumbNailArr:[Upload!], # 뒤에 ! 없음 # 다시 뺌
//       # isFirstVideo:Boolean!, # 추가함 # 다시 뺌
//       body: [String!]!,
//       dateTime: String!,
//       youtubeId: String,
//       requestMusic: Boolean!
//       summaryBody: String,
//     ): UploadDiaryResponse!
//   }
// `;