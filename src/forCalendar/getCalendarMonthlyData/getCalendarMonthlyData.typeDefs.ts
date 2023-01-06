import { gql } from "apollo-server-express";

export default gql`
  type Query {
    getCalendarMonthlyData(
      year:Int!
      month:Int!
      # 걍 결과를 json 으로 보낼까? 굳이 [Calendar] 로 쓸 필요가 있을라나?
    ):[Calendar]
    # ):JSON
  }
`;