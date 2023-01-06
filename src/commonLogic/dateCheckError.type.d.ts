type dateCheckErrorType = {
  formError:boolean,
  formErrorType?:FormErrorType,
  // which?:string,
  which?:"dateTime"|"year"|"month"|"date"|"summaryBody", //"body"
};

type dateCheckErrorFn = (props:{
  year: number,
  month: number,
  date?: number,
  nowYear?: number,
  nowMonth?: number,
}) => dateCheckErrorType;

export { dateCheckErrorType, dateCheckErrorFn };