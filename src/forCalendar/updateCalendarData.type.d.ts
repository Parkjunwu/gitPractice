
type workTypeAndNeededDataType = {
  uploadDiary?:{
    // dateTime: number,
    id: number,
    title: string,
    summaryBody: string | null,
  },
  editDiary?:{
    id: number,
    title?: string,
    summaryBody?: string | null,
  },
  deleteDiary?:{
    id: number,
  },
};

type workTypeDataType = {
  // dateTime?: number,
  date?: number,
  id: number,
  title?: string,
  summaryBody?: string | null,
};

export { workTypeAndNeededDataType, workTypeDataType }