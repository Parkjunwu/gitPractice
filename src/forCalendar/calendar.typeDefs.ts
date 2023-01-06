import { gql } from "apollo-server-express";

// 걍 json 으로 보낼까? 굳이 이래 할 필요가 있을라나?
export default gql`
  type Calendar {
    id: Int!
    title: String!
    date: Int!
    summaryBody: String
  }
`;