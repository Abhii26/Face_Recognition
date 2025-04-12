console.log(faceapi)


const faceList = [
  { name: "Sourav", imagePath: "images/sourav.jpg" },
  { name: "Abhishek", imagePath: "images/abhishek.jpg" },
  { name: "Himanshu Sir", imagePath: "images/himanshu.jpg" },
  { name: "Priya Mam", imagePath: "images/priya.jpg" },
  { name: "Daksh", imagePath: "images/daksh.jpg" }
];



const run = async()=>{
    //loading the models is going to use await
    const stream = await navigator.mediaDevices.getUserMedia({
        video : true,
        audio : false
    })
    const videoStart = document.getElementById("videoId")
    videoStart.srcObject = stream

    
//we need to load our models
//Pre-Trained  ML for Facial Detection
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri("./models")

    ])

    //making canvas same size as of my video
 const canvas = document.getElementById("canvas")
 canvas.style.left = videoStart.offsetLeft
 canvas.style.top = videoStart.offsetTop
 canvas.height = videoStart.height
 canvas.width = videoStart.width


  // 🔁 Load face descriptors for all people
  const labeledDescriptors = await loadLabeledFaceDescriptors();
  const faceMatch = new faceapi.FaceMatcher(labeledDescriptors);


// matching the face with the photo

 const refFace = await faceapi.fetchImage("images/sourav.jpg");
const refFaceData = await faceapi.detectSingleFace(refFace).withFaceLandmarks().withFaceDescriptor();

if (!refFaceData) {
  console.error("No face detected in reference image.");
  return;
}

 //facial detection with points
 
setInterval(async () => {
   // giving video feed to detectAllfaces Method
   const faceData = await faceapi.detectAllFaces(videoStart).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender()

   // we have a ton of good facial detection data in faceData
// faceData is an array, one element for each face


// draw on our face/canvas

//clearing the canvas

canvas.getContext("2d").clearRect(0,0, canvas.width, canvas.height)

//making rectangular box
const faceNewData = faceapi.resizeResults(faceData, videoStart)
faceapi.draw.drawDetections(canvas, faceNewData)
faceapi.draw.drawFaceLandmarks(canvas, faceNewData)
faceapi.draw.drawFaceExpressions(canvas, faceNewData)




// ask AI to guess age and gender with confidence level
faceNewData.forEach(face => {
    const { age, gender, genderProbability, detection, descriptor } = face; 
    const genderText = `${gender} - ${Math.round(genderProbability * 100)}%`;
    const ageText = `${Math.round(age)} years`;
    const textField = new faceapi.draw.DrawTextField([genderText, ageText], face.detection.box.topRight);
    textField.draw(canvas);
  
 // Match face with reference
 const bestMatch = faceMatch.findBestMatch(descriptor);
 console.log(bestMatch.toString());

 const drawBox = new faceapi.draw.DrawBox(detection.box, {
   label: bestMatch.label === "unknown" ? "Unknown Subject..." : bestMatch.label,
 });
 drawBox.draw(canvas);
});
}, 200) 


 

}




async function loadLabeledFaceDescriptors() {
  const promises = faceList.map(async (person) => {
    const img = await faceapi.fetchImage(person.imagePath);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) {
      console.warn(`No face detected for ${person.name}`);
      return null;
    }
    return new faceapi.LabeledFaceDescriptors(person.name, [detection.descriptor]);
  });

  const results = await Promise.all(promises);
  return results.filter((desc) => desc !== null);
}





run()