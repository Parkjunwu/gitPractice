import { Prisma } from "@prisma/client";
import { workTypeDataType } from "../updateCalendarData.type";
import { workTypeType } from "./common.type";

type ConsoleError = (workType: workTypeType) => null;

type MonthColumnDataAndIsMonthColumnArrayType = (prevDiaryListData: any, convertedMonth: string) => {
  monthColumnData: Prisma.JsonObject[] | null;
  isMonthColumnArray: boolean;
};

type YearIndexAndCheckRightType = (monthColumnData: Prisma.JsonObject[], diaryYear: number|string) => {
  yearIndex: number;
  checkRight: boolean;
};

// type ConvertJSONPropsType = {
//   prevDiaryListData: any[],
//   convertedMonth: string,
//   diaryYear: number|string,
//   tableName: string,
//   workTypeData: workTypeDataType
// };


type passingPropsType = {
  prevDiaryListData: {
      [key: string]: any;
  };
  convertedMonth: string;
  diaryYear: number;
  tableName: string;
  workTypeData: workTypeDataType;
}

// type DeleteConvertJSONType = (props:ConvertJSONPropsType) => Prisma.JsonArray|null;

// type ConvertJSONType = (props:ConvertJSONPropsType) => Prisma.JsonArray;
type DeleteConvertJSONType = (props:passingPropsType) => Prisma.JsonArray|null;

type ConvertJSONType = (props:passingPropsType) => Prisma.JsonArray;


type convertDataType = (
  workType: workTypeType,
  passingProps: passingPropsType,
) => Prisma.JsonArray|null;

export {
  ConsoleError,
  MonthColumnDataAndIsMonthColumnArrayType,
  YearIndexAndCheckRightType,
  ConvertJSONType,
  DeleteConvertJSONType,
  // workTypeType,
  passingPropsType,
  convertDataType,
};