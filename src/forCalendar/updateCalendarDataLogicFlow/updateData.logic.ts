import { Prisma } from "@prisma/client";
import client from "../../client";
import { passingPropsForUpdateType } from "./updateData.type";

const editAndDeleteUpdateCalendarData = async ({
  tableName,
  userId,
  convertedMonth,
  updatedDiaryListData,
}:passingPropsForUpdateType) => await client[tableName].update({
    where:{
      userId,
    },
    data:{
      // null 말고 Prisma.DbNull 써야 된대.
      [convertedMonth]:updatedDiaryListData ?? Prisma.DbNull,
    },
    select:{
      id:true,
    },
  });

const uploadDiaryUpdateCalendarData = async ({
  tableName,
  userId,
  convertedMonth,
  updatedDiaryListData,
  prevDiaryListData,
}:passingPropsForUpdateType) => {
  // update 말고 create 도 있어야함. 없는 경우 생성해야돼.
  const dataLogic = (workType:"create" | "update") => ({
    data:{
      // m1:updatedDiaryListData,
      [convertedMonth]:updatedDiaryListData,
      ...(workType === "create" && {
        user:{
          connect:{
            id:userId,
          },
        },
      }),
    },
    select:{
      id:true,
    },
  });

  if(!prevDiaryListData) {
    // await client.y22.create({
    await client[tableName].create({
      ...dataLogic("create"),
    });
  } else {
    // await client.y22.update({
    await client[tableName].update({
      where:{
        userId,
      },
      ...dataLogic("update"),
    });
  }
};

export { editAndDeleteUpdateCalendarData, uploadDiaryUpdateCalendarData };