//To build the grid
let sizes = []
let rows = 10; let cols = 10; let size = 25;
let xOff = 0; let yOff = 0; let zOff = 0; let inc = 0.1
let amplitudeCoeff = 3; //volume value

let fft; let smoothing = 0.8; let bins = 512;
let waveform = [];
let mic;

//Song management
let songs = [];
let currentSong = null;
let isPlaying = false;
let currentSongNum = null;

//To build image grid
let tDistance = 1000;
let wSize = 2560/5;
let hSize = 1920/5;
let rImage = []
let imageIndences = [];
let imageNum = 22;
let totalImages = 26;

//WASDMovement
let speed = 3;
//References to html elements
let progressBar = document.getElementById('progress-bar');

function preload(){
  songs[0] = loadSound("music/Baby Blue Movie - Cigarettes After Sex [BeAzmDCWUzI].mp3");
  songs[1] = loadSound("music/Bubblegum - Cigarettes After Sex [Y4lU3EdvnUU].mp3");
  songs[2] = loadSound("music/Tejano Blue - Cigarettes After Sex [--JuMkludKM].mp3");
  songs[3] = loadSound("music/d4vd - My House Is Not A Home [B4UdAJxAoiw].mp3");
  songs[4] = loadSound("music/d4vd - Romantic Homicide [eKL3TceSxvk].mp3");
  songs[5] = loadSound("music/Jigsaw Falling Into Place by. Radiohead [TR2HPSjcJ7I].mp3");
  songs[6] = loadSound("music/Radiohead - All I Need [wUL8NklXDsw].mp3");
  songs[7] = loadSound("music/Mojo Pin [Svo7LZbnUVw].mp3");

  //Creating an array of image indexes
  for (let i=0; i<totalImages; i++){
    imageIndences.push(i);
  }

  //Shuffling and trimming them
  imageIndences = shuffle(imageIndences, true).slice(0, imageNum);

  //loading images at random indexes in order
  for(let i=0; i<imageNum; i++){  
    let imgIndex = imageIndences[i];
    rImage[i] = loadImage(`images/img (${imgIndex}).jpg`);
  }
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    rectMode(CENTER);
    angleMode(DEGREES);
    // colorMode(HSB);

    cam = createCamera();
    cam.move(0, -50, -50);

    tint(255, 0); 
    // camera(0, 0, 250);

    // Start the mic
    // mic = new p5.AudioIn();
    // mic.start();
    
    //Playing the song and setting up FFT
    // song.play();
    // song.stop();
    fft = new p5.FFT(smoothing, bins);
}

function cubeGrid(amp) {
  rotateX(-45);
  rotateY(-45);
  translate(-25, -75, -25);

  for (let i = 0; i < rows; i++) {
    sizes[i] = [];
    xOff += inc;

    for (let j = 0; j < cols; j++) {
      //Setting the locations for the boxes
      yOff += inc;
      xOff += inc;
      sizes[i][j] = map(noise(xOff, yOff, zOff), 0, 1, 0, size * 1.1);

      //Changing the color based on zOff
      let r = map(noise(zOff), 0, 1, 50, 255);   // cut off dark grays
      let g = map(noise(yOff), 0, 1, 50, 255);
      let b = map(noise(xOff + 15), 0, 1, 50, 255);

      // Another option
      // colorMode(HSB, 255);
      // let h = map(noise(xOff * 0.5, yOff * 0.5, zOff), 0, 1, 0, 255); 
      // let s = map(noise(yOff, zOff), 0, 1, 180, 200);   // keep saturation high
      // let b = map(noise(xOff, zOff), 0, 1, 180, 200);   // keep brightness high
      // fill(h, s, b);
      fill(r, g, b);
      // fill(50);    
      // rect(size/2 + i*size, size/2 + j*size, sizes[i][j], sizes[i][j]);
      //Drawing multiple boxes
      push();
      translate(size * i - 100, sizes[i][j] * map(amp, 0, 255, 0.25, 15) * 3, size * j - 100);
      box(size, 300, size);
      pop();
    }
    // rotateY(map(amp, 0, 255, 0, 180));
    // rotateZ(map(amp, 0, 255, 0, 180));
    // rotateX((map(noise(zOff), 0, 1, 0, 45)))
    // rotateY(map(noise(zOff), 0, 1, 0, 45));
    yOff = 0;
  }
  zOff += 0.003;
  xOff = 0;
}

function imageGrid(){
  let rectImgIndex = 0;

  for (let i=0; i<360; i+=30){
    // xOff += 0.03
    // yOff += 0.03
    // let n = noise(xOff, yOff, zOff);
    // let nMove = map(n, 0, 1, 0, 360);
    

    push();
    rotateX(i);
    // line(0, 0, 0, 0, 0, 200);
    pop();

    push();
    rotateX(i);
    // rotateY(i + nMove) //for organic movement with noise
    translate(0, tDistance, 0);
    rotateX(atan2(1, 0))
    texture(rImage[rectImgIndex]);
    rectImgIndex++;
    rect(0, 0, wSize, hSize);
    
    pop();
  }
  for(let l=0; l<360; l+=30){
    
    push();
    rotateY(l)
    // line(0, 0, 0, 200, 0, 0);
    pop();
    
    push();
    rotateY(l);
    translate(0, 0, tDistance)
    if (l != 0 && l != 180){
      texture(rImage[rectImgIndex]);
      rectImgIndex++
      rect(0, 0, wSize, hSize)
    }
    //so that we the rects don't overlap
    pop();
  }
}

function wasdMove(){
  cam.move(
      // D - right, A - left 
      (keyIsDown(68) ? speed : 0) + (keyIsDown(65) ? -speed : 0),
      // Q - down, E - up
      (keyIsDown(81) ? speed : 0) + (keyIsDown(69) ? -speed : 0),
      // S - backward, W - forward
      (keyIsDown(83) ? speed : 0) + (keyIsDown(87) ? -speed : 0)
    );
}

function songAnalyze() {
  let spectrum = fft.analyze();
  let amp = fft.getEnergy("mid");
  amplitudeCoeff = map(amp, 0, 255, 0, 1);
  return amp
}

function playSong(songNum){
    console.log("Playing song:", songNum)

    if (currentSong && currentSong.isPlaying()){
        currentSong.stop();
    }

    if(songs[songNum] && songs[songNum].isLoaded()){
        currentSong = songs[songNum];
        currentSongNum = songNum;
        currentSong.play(); 
        isPlaying = true;

        if(fft){
            fft.setInput(currentSong);
        }

        //Update UI here
    }

    else{
        console.log("song not loaded yet");
    }

    //Stop all the songs
    // songs.forEach((song, i) => {
    //     if(i != songNum){
    //         song.stop();
    //     }
    // });

    //Play the desired song
    // songs[songNum].play();
}

function tooglePlayPause(){
    if(currentSong.isPlaying()){
        currentSong.pause();
        isPlaying = false;
        //Pause visuals
    }
    else{
        currentSong.play();
        isPlaying = true;
        //Resume Visuals
    }
    updatePlayPauseBtn();
}

function updatePlayPauseBtn(){
    document.getElementById('playPauseBtn').textContent = isPlaying? '⏸️' : '▶️';
}

function updateProgress(value){
    let minute = map(value, 0, 100, 0, currentSong.duration())
    currentSong.jump(minute);
}

function updateProgressUI(){
    // for(i=0; i<currentSong.duration(); i++){
    //     let moment = map(i, 0, currentSong.duration(), 0, 100)
    //     progressBar.value = moment
    //     print("moment:", moment);
    // }
    if (currentSong && currentSong.isPlaying()){
        let minute = map(currentSong.currentTime(), 0, currentSong.duration(), 0, 100)
        progressBar.value = minute;
    }
}

function hideUI(){
  // let elems = document.getElementsByClassName("keyboard-controls");
  // for (let i; i<elems.length; i++){
  //   elems[i].style.opacity = "0";
  // }
  document.getElementById("controls").style.opacity = "0";
  document.getElementById("coming-soon").style.opacity = "0";
}

function showUI(){
  // let elems = document.getElementsByClassName("keyboard-controls");
  // for (let i; i<elems.length; i++){
  //   elems[i].style.opacity = "0";
  // }
  document.getElementById("controls").style.opacity = "1";
  document.getElementById("coming-soon").style.opacity = "1";
}

function Lighting() {
    ambientLight(60, 60, 80); // Soft base lighting
    directionalLight(255, 255, 255, -1, 0.5, -1); // Main light from top-left


    // Optional: Add a colored accent light
    pointLight(50, 25, 100, -200, -100, 200);
}

//U STOPPED HERE. Need to make play/stop, and scroll functionality. Then in css add some sweet text on the right
function draw() {
  background(46, 52, 66);
  noStroke();
  orbitControl();

  wasdMove();
  
  userStartAudio(); // Ensure audio context is started
  let amp = songAnalyze();
  updateProgressUI();

  if(amp>0){
    imageGrid();
    hideUI();
  }
  if(amp==0){
    showUI();
  }
  // Lighting();
  cubeGrid(amp);

    // ADD LIGHTING HERE
    // Lighting();

    //Getting mic volume
    // amp = mic.getLevel() * 100
    // amplitudeCoeff = map(amp, 0, 100, 0, 10)

    //Analyzing the song. Use .getEnergy() for specific frequencies
    // like this amp = fft.getEnergy("bass");
    
    // print("spectrum:" + spectrum);
    // print("amp:" + amp);
    // print("amplitudeCoeff:" + amplitudeCoeff);
    // Adjust the range as needed
    

    //Using .waveform() or .analyze()
    // waveform = fft.waveform();
    // print(waveform);

    //Drawing the grid
   
}


// To do:
// Functions:

// - Images appear when music is Playing (?)
// - Small text box with controls (+)
// - Music controls opacity (+)
// - Random Picture choice in ChatGPT


// 1. Tempo is the inc amount for the zOff parameter
// 2. Volume as the box height or amplitudeCoeff (+)
// 3. Camera go down with the box and come closer when it goes down

