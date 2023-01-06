import { Prisma } from "@prisma/client";
import { workTypeType } from "./common.type";

type passingPropsForUpdateType = {
  tableName: string;
  userId: number;
  convertedMonth: string;
  updatedDiaryListData: Prisma.JsonArray | null;
  prevDiaryListData: {
    [key: string]: any;
  };
}

type updateDataType = (
  workType: workTypeType,
  passingPropsForUpdate: passingPropsForUpdateType
) => Promise<void>;


export { passingPropsForUpdateType, updateDataType };