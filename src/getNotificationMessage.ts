
const getNotificationMessage = (which:string) => {
  switch (which) {
    case "MUSIC_SELECTED":
      return "회원님의 일기에 노래가 지정되었습니다."
    case "MUSIC_CHANGED":
      return "회원님이 요청하신 일기의 노래가 변경되었습니다."
    default:
      console.error("getNotificationMessage // invalid input.");
  }
};

export default getNotificationMessage;