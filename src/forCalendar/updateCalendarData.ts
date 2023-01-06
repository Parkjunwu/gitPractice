import { getDateDataForCalendar } from "./calendar.utils";
import { workTypeAndNeededDataType, workTypeDataType } from "./updateCalendarData.type";
import getPrevData from "./updateCalendarDataLogicFlow/1getPrevData";
import convertData from "./updateCalendarDataLogicFlow/2convertData";
import updateData from "./updateCalendarDataLogicFlow/3updateData";
import { workTypeType } from "./updateCalendarDataLogicFlow/common.type";
import { passingPropsType } from "./updateCalendarDataLogicFlow/convertData.type";

const updateCalendarData = async(
  workTypeAndNeededData: workTypeAndNeededDataType,
  dateTime: number,
  userId: number,
) => {

  // 유형 확인
  // let workType: "uploadDiary"|"editDiary"|"deleteDiary";
  let workType: workTypeType;
  let workTypeData: workTypeDataType;

  // DB 관련 필요한 정보 가져옴.
  const { diaryYear, tableName, convertedMonth, diaryDate } = getDateDataForCalendar(dateTime);

  if(workTypeAndNeededData.deleteDiary){

    workType = "deleteDiary";
    workTypeData = workTypeAndNeededData.deleteDiary;

  } else if (workTypeAndNeededData.editDiary) {

    workType = "editDiary";
    workTypeData = workTypeAndNeededData.editDiary;

  } else if (workTypeAndNeededData.uploadDiary) {

    workType = "uploadDiary";
    workTypeData = {
      ...workTypeAndNeededData.uploadDiary,
      // dateTime,
      date:diaryDate,
    };

  }

  if(!workType) return console.error("updateCalendarData 에 workTypeAndNeededData 인수 잘못 들어옴.");
  // if(!workType) return console.error("updateCalendarData // invalid workTypeAndNeededData params.");

  // 데이터 조회
  const prevDiaryListData = await getPrevData(tableName,convertedMonth,userId);

  // JSON 데이터 변경
  const passingProps: passingPropsType = {
    prevDiaryListData,
    convertedMonth,
    diaryYear,
    tableName,
    workTypeData,
  };

  const updatedDiaryListData = convertData(workType,passingProps);

  // 데이터 업데이트
  const passingPropsForUpdate = {
    tableName,
    userId,
    convertedMonth,
    updatedDiaryListData,
    prevDiaryListData, // 얘는 upload 에만 필요하지만 계산하면 보기 불편해져서 걍 다 넣음
  };

  await updateData(workType,passingPropsForUpdate);

};

export default updateCalendarData;