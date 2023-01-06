import client from "../../client";

type GetPrevDiaryListDataType = (
  tableName:string,
  convertedMonth:string,
  userId:number,
) => Promise<{[key:string] : any} | null>

const getPrevData: GetPrevDiaryListDataType = async (
  tableName,
  convertedMonth,
  userId,
) => 
  // await client.y22.findUnique({
  await client[tableName].findUnique({
    where:{
      userId,
    },
    select:{
      // m1:true,
      [convertedMonth]:true,
    },
  });

export default getPrevData;