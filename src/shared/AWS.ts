import * as AWS from "aws-sdk"
import superagent from "superagent";
import sendEmailUploadErrorToAdmin from "./sendEmailUploadErrorToAdmin";

AWS.config.update({
  credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
  },
  region: "ap-northeast-2",
})


const s3 = new AWS.S3();
const baseBucket = "music-diary-upload";
const videoConvertBucket = "for-hls-video-convert";
const videoFolder = "video/";
const videoHlsEndNameAndExtension = "_hls.m3u8";
// const thumbNailEndNameAndExtension = ".0000000.jpg"; // thumbNail 안만듦

// folderName S3 에 저장할 폴더명임.
// export const async_uploadPhotoS3 = async(fileToUpload, userId, folderName) => {
export const async_uploadPhotoS3 = async(fileToUpload, userId, dateForUnique, folderName) => {
  try {
    // const { file: { filename, createReadStream, mimetype } } = await fileToUpload;
    const { file } = await fileToUpload;
    console.log("async_uploadPhotoS3 : " + JSON.stringify(file));
    const { filename, createReadStream, mimetype } = file;
    // Cannot read properties of undefined (reading 'filename') 뜨는 경우가 있음. 왠진 몰라. 한번 그러면 계속 그러고 서버 다시 시작해야 됨. 왜 이런거지?
    // const getInfo = await fileToUpload;
    // console.log(getInfo)
    // const { file : { filename, createReadStream, mimetype }} = getInfo;
    const readStream = createReadStream();
    let Bucket;
    let objectName;
    const isVideo = mimetype === "video/mp4";
    // const baseObjectName = `${userId}-${Date.now()}-${filename}`;
    const baseObjectName = `${userId}-${dateForUnique}-${filename}`;
    if(isVideo) {
      Bucket = videoConvertBucket;
      objectName = baseObjectName;
    } else {
      Bucket = baseBucket;
      objectName = `${folderName}/${baseObjectName}`;
    }
    // const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
    const {Location} = await new AWS.S3().upload({
      Bucket,
      Key:objectName,
      ACL:"public-read",
      Body:readStream,
    }).promise();
    
    if(isVideo) {
    
      const deleteBucketArr = Location.split(videoConvertBucket);

      const newBucketLocation = deleteBucketArr[0] + baseBucket + deleteBucketArr[1];

      const stringLength = newBucketLocation.length;
      const deleteExtensionLocation = newBucketLocation.substring(0,stringLength-4);
      const bucketEnd = ".com/";
      const urlArr = deleteExtensionLocation.split(bucketEnd);
      const baseObjectNameDeletedExtension = urlArr[1];
      const videoFolderLocation = urlArr[0] + bucketEnd + videoFolder + baseObjectNameDeletedExtension;
      const videoHlsFileLocation = videoFolderLocation + "/" + baseObjectNameDeletedExtension + videoHlsEndNameAndExtension;
      
      return videoHlsFileLocation;
    }

    return Location;
  } catch(e) {
    sendEmailUploadErrorToAdmin();
    throw new Error("AWS upload error");
  }
}

// folderName S3 에 저장할 폴더명임.
// export const async_uploadThumbNailS3 = async(fileToUpload, userId) => {
export const async_uploadThumbNailS3 = async(fileToUpload, userId, dateForUnique) => {
  const { file: { filename, createReadStream, mimetype } } = await fileToUpload;

  // console.log("mimetype : "+mimetype)
  // if(mimetype === "video/mp4") {
  // image 타입이 여러개임. 혹시 이상하면 이거 변경.
  if(mimetype !== "image/jpeg" && mimetype !== "image/png") {
    console.error("async_uploadThumbNailS3 // thumbnail get something not image. Hacking possibility.");
    throw new Error();
  }
  // const getInfo = await fileToUpload;
  // console.log(getInfo)
  // const { file : { filename, createReadStream, mimetype }} = getInfo;
  const readStream = createReadStream();

  // 확장자 제거
  const [filenameWithoutExtension,imageExtension] = filename.split(".");
  
  const thumbNailMark = "_hls_thumbNail";
  
  // const hlsFolderName = `${userId}-${Date.now()}-${filenameWithoutExtension}`;
  const hlsFolderName = `${userId}-${dateForUnique}-${filenameWithoutExtension}`;
  const thumbNailObjectName = hlsFolderName + thumbNailMark;
  const Bucket = baseBucket;
  // 여기 폴더를 비디오 있는 데로 넣어야해. 
  const objectName = `${videoFolder}${hlsFolderName}/${thumbNailObjectName}.${imageExtension}`;
  // const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
  const {Location} = await new AWS.S3().upload({
    Bucket,
    Key:objectName,
    ACL:"public-read",
    Body:readStream,
  }).promise();
  
  return Location;
}

const callBack = (error, data) => {
  if (error) {
    console.log(error);
    console.log("삭제 에러");
    throw new Error();
  } else {
  console.log(data);
  console.log("삭제 완료");
  }
};


/// fileUrl string, 파일 이름 꺼내기
// export const async_deletePhotoS3 = async (fileUrl:string, folderName:string) => {
export const async_deletePhotoS3 = async (fileUrl:string) => {
  const decodedUrl = decodeURI(fileUrl);  //한글일 경우 이래 해야 된다함

  const bucketEnd = ".com/";
  const urlArr = decodedUrl.split(bucketEnd);
  const folderAndFileName = urlArr[1];
  const isVideo = folderAndFileName.startsWith("video"); // "v" 로 해도 되는데 걍 보기 좋게

  if(isVideo) {
    // m3u8 받아서 읽고 안에 .ts 목록 꺼냄
    const {text} = await superagent.get(fileUrl).buffer(true).parse(superagent.parse.text);
    const eachTextLineArr = text.split('\n');
    const tsFileArr = eachTextLineArr.filter(textLine=>textLine.endsWith(".ts"));

    const [_,folderName,m3u8File] = folderAndFileName.split("/");

    const folderPath = videoFolder + folderName + "/";
    
    const listedObjects = tsFileArr.map(file=>({ Key: folderPath+file }));
    // m3u8 파일도 추가
    const m3u8FileKey = folderPath + m3u8File;
    listedObjects.push({ Key: m3u8FileKey });
    
    // thumbNail 도 추가
    // const thumbNail = decodedUrl.slice(0,decodedUrl.length-5) + "_thumbNail.jpg"; // .jpg 하면 될라나? png 같은게 들어올 수도 있나?
    const thumbNailKey = m3u8FileKey.slice(0,m3u8FileKey.length-5) + "_thumbNail.jpg";
    listedObjects.push({ Key: thumbNailKey });

    // console.log("listedObjects : "+JSON.stringify(listedObjects));
    
    const deleteParams = {
      Bucket: baseBucket,
      Delete: { Objects: listedObjects }
    };

    await s3.deleteObjects(deleteParams,callBack).promise();

  } else {
    const params = {
      Bucket: baseBucket,
      Key: folderAndFileName,
    };

    await s3.deleteObject(params,callBack).promise();
}
};


// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";

// const REGION = "ap-northeast-2";
// const s3Client = new S3Client({ region: REGION });
// const Bucket = "music-diary-upload";

// // // folderName S3 에 저장할 폴더명임.
// export const async_uploadPhotoS3 = async(fileToUpload, userId, folderName) => {
//   // const { filename, createReadStream } = await file;
//   // const res = await file;
//   // console.log("res")
//   // console.log(res)
//   // const { filename, createReadStream } = res;
//   const { file:{filename, createReadStream} } = await fileToUpload;
//   const readStream = createReadStream();
//   // const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
//   const objectName = `${userId}`;
//   const bucketParams = {
//     Bucket,
//     Key: objectName,
//     Body: readStream,
//   };
//   // const data = await s3Client.send(new PutObjectCommand(bucketParams));
//   // console.log("S3 업로드 성공. ", data);
//   // // data 에서 파일 명 받아야 함. data.Location 은 아닌듯.
//   // return data;
//   const parallelUploads3 = new Upload({
//     client: new S3Client({}),
//     params: bucketParams,
//   });

//   parallelUploads3.on("httpUploadProgress", (progress) => {
//     console.log("progress");
//     console.log(progress);
//   });

//   const result = await parallelUploads3.done();
//   console.log("result")
//   console.log(result)
// };


// // fileUrl string, 파일 이름 꺼내기
// export const async_deletePhotoS3 = async (fileUrl:string, folderName:string) => {
//   const decodedUrl = decodeURI(fileUrl);  //한글일 경우 이래 해야 된다함
//   // const filePath = decodedUrl.split("com/")[1]; // 파일명만 split 후 선택. 폴더명이 지금은 uploads 로 고정인데 혹시 바뀌면 여기 변경해야함.
//   const filePath = decodedUrl.split("/uploads/")[1]; // 파일명만 split 후 선택
//   const params = {
//     // Bucket에 폴더 명 uploads 추가, 혹시 폴더명 고정이면 이 함수를 변경. 혹은 그냥 폴더 안만들고 저장해도 됨. 그치만 저장하는게 낫겠지
//     Bucket: `${Bucket}/${folderName}`, // Bucket에 폴더 명 uploads 추가
//     Key: filePath, 
//   };
//   // const bucketParams = { Bucket, Key: "KEY" };
//   const data = await s3Client.send(new DeleteObjectCommand(params));
//   console.log("S3 삭제 성공.", data);
//   return data;
// };

export const S3_FOLDER_NAME = "uploads";