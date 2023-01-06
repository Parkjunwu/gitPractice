// 이러면 안됨. 이건 딱 처음 실행했을 때 값이 저장됨. 부를 때마다 Date 계산하는게 아냐. 함수로 꺼내야함.

// !!!!!!중요!!!!! 년마다 바꿔줘야 함
// 그냥 쓸까? nowYear = new Date().getFullYear(); 로
// export const nowYear = 2022;
// const date = new Date();
// const nowYear = date.getFullYear();
// const nowMonth = date.getMonth()+1;
// const nowDate = date.getDate();

// // !!!!!!중요!!!!! 년마다 바꿔줘야 함
// // 얘도 뭐 nowYearTableName = "y"+(nowYear-2000);
// // export const nowYearTableName = "y22";

// // !!!!!!중요!!!!! 년마다 바꿔줘야 함
// // 얘도 뭐 for 문으로 넣으면 될듯? 
// const prevYearsOnDataBaseList = [];
// for(let i=2022; i<nowYear; i++){
//   prevYearsOnDataBaseList.push(i);
// }
const getNow = () => {
  const date = new Date();
  const nowYear = date.getFullYear();
  const nowMonth = date.getMonth()+1;
  const nowDate = date.getDate();

  // !!!!!!중요!!!!! 년마다 바꿔줘야 함
  // 얘도 뭐 nowYearTableName = "y"+(nowYear-2000);
  // export const nowYearTableName = "y22";

  // !!!!!!중요!!!!! 년마다 바꿔줘야 함
  // 얘도 뭐 for 문으로 넣으면 될듯? 
  // const prevYearsOnDataBaseList = [];
  // for(let i=2022; i<nowYear; i++){
  //   prevYearsOnDataBaseList.push(i);
  // }

  return { nowYear, nowMonth, nowDate, }
};

const getPrevYearsOnDataBaseListAndNowYear = () => {

  const date = new Date();
  const nowYear = date.getFullYear();

  const prevYearsOnDataBaseList = [];

  for(let i=2022; i<nowYear; i++){
    prevYearsOnDataBaseList.push(i);
  }

  return {prevYearsOnDataBaseList,nowYear};
};

const minimumYear = 1970;

// export { nowYear, nowMonth, nowDate, prevYearsOnDataBaseList, minimumYear };
export { getNow, getPrevYearsOnDataBaseListAndNowYear, minimumYear };