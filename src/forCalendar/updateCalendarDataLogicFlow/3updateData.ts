import { editAndDeleteUpdateCalendarData, uploadDiaryUpdateCalendarData } from "./updateData.logic";
import { updateDataType } from "./updateData.type";

const updateData: updateDataType = async (
  workType,
  passingPropsForUpdate
) => {

  const isUpload = workType === "uploadDiary";
  
  if(isUpload) {

    await uploadDiaryUpdateCalendarData(passingPropsForUpdate);

  } else {
    
    await editAndDeleteUpdateCalendarData(passingPropsForUpdate);

  }
};

export default updateData;