import yearAndMonthCheck from "../../commonLogic/yearAndMonthCheck";
import { Resolver, Resolvers } from "../../types";
import { protectResolver } from "../../user/user.utils";
import { getTableName } from "../calendar.utils";
import { getMonthColumnDataAndIsMonthColumnArray, getYearIndexAndCheckRight } from "../updateCalendarDataLogicFlow/convertData.common";

const getCalendarMonthlyDataFn: Resolver = async(_,{year,month},{client,logInUserId}) => {

  // year month 형식 체크.
  const { formError, which } = yearAndMonthCheck({year,month});

  if(formError) {
    const errorMessage = which ?
      `get invalid ${which}. Hacking possibility`
    :
      "get previous than minimumYear. Hacking possibility";
    console.error("getCalendarMonthlyData // " + errorMessage);
    return null;
  }

  const tableName = getTableName(year);
  const convertedMonth = "m" + month;

  // const result = await client.y22.findUnique({
  const result = await client[tableName].findUnique({
    where:{
      userId:logInUserId,
    },
    select:{
      // m2:true,
      [convertedMonth]:true,
    },
  });

  // return result?.m2;
  // const monthlyData = result?.[convertedMonth];
  const { monthColumnData } = getMonthColumnDataAndIsMonthColumnArray(result,convertedMonth);

  if(!monthColumnData || tableName[0] === "y"){
    return monthColumnData;
  } else {
    const { yearIndex, checkRight:isData } = getYearIndexAndCheckRight(monthColumnData,year);

    return isData ? monthColumnData[yearIndex][year] : null;
  }
};

const resolver: Resolvers = {
  Query: {
    getCalendarMonthlyData: protectResolver(getCalendarMonthlyDataFn),
  },
};

export default resolver;