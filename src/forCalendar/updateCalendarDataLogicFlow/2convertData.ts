import { Prisma } from "@prisma/client";
import { deleteDiaryConvertJSON, editDiaryConvertJSON, uploadDiaryConvertJSON } from "./convertData.logic";
import { convertDataType } from "./convertData.type";

// JSON 데이터 변경
const convertData: convertDataType = (workType,passingProps) => {

  let updatedDiaryListData: Prisma.JsonArray|null;

  switch(workType) {
    case "uploadDiary":
      updatedDiaryListData = uploadDiaryConvertJSON(passingProps);
      break;
    case "editDiary":
      updatedDiaryListData = editDiaryConvertJSON(passingProps);
      break;
    case "deleteDiary":
      updatedDiaryListData = deleteDiaryConvertJSON(passingProps);
      break;
  }

  return updatedDiaryListData;
};

export default convertData;