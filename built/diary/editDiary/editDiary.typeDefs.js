"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
exports.default = (0, apollo_server_express_1.gql) `
  # Upload 는 JSON 으로 하니까 안뜸.
  # input addFileObj {
  #   index: Int
  #   File: Upload
  # }
  type Mutation {
    editDiary(
      id:Int!,
      title:String,
      body:[String!],
      # thumbNail:Upload,
      # deletePrevThumbNail:Boolean,
      changeThumbNail: Boolean,
      # addFileArr:[addFileObj],
      # 그래서 그냥 파일과 인덱스를 따로 받음. 안헷갈리게 주의. 순서가 같아야 하는거 중요.
      addFileArr:[Upload!],
      addFileIndexArr:[Int!],
      addThumbNailArr: [Upload!],
      deleteFileArr:[String!],
      # wholeFileArr 는 addFileIndex 자리를 "" 로 해줘야함. 꼭 확인
      wholeFileArr:[String!],
      youtubeId:String,
      summaryBody: String,
      # deleteYoutubeMusic:Boolean!
    ):MutationResponse!
  }
`;
// // 동영상 하나로 바꾼 후
// import { gql } from "apollo-server-express";
// export default gql`
//   # Upload 는 JSON 으로 하니까 안뜸.
//   # input addFileObj {
//   #   index: Int
//   #   File: Upload
//   # }
//   type Mutation {
//     editDiary(
//       id:Int!,
//       title:String,
//       body:[String!],
//       changeThumbNail: Boolean,
//       # addFileArr:[addFileObj],
//       # 그래서 그냥 파일과 인덱스를 따로 받음. 안헷갈리게 주의. 순서가 같아야 하는거 중요.
//       addFileArr:[Upload!],
//       addFileIndexArr:[Int!],
//       # addThumbNailArr: [Upload!],
//       videoFile: Upload, # video 추가
//       videoIndex: Int, # video 추가
//       videoThumbNail: Upload, # video 추가
//       deleteFileArr:[String!],
//       # wholeFileArr 는 addFileIndex 자리를 "" 로 해줘야함. 꼭 확인
//       wholeFileArr:[String!],
//       youtubeId:String,
//       summaryBody: String,
//       # deleteYoutubeMusic:Boolean!
//     ):MutationResponse!
//   }
// `
