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

//References to html elements
let progressBar = document.getElementById('progress-bar');

function preload(){
    songs[0] = loadSound("duvet - Aaron Terrapin.wav");
    songs[1] = loadSound("SoReal.mp3");
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    rectMode(CENTER);
    angleMode(DEGREES);

    // Start the mic
    // mic = new p5.AudioIn();
    // mic.start();
    
    //Playing the song and setting up FFT
    // song.play();
    // song.stop();
    fft = new p5.FFT(smoothing, bins);
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

function Lighting() {
    ambientLight(60, 60, 80); // Soft base lighting
    directionalLight(255, 255, 255, -1, 0.5, -1); // Main light from top-left


    // Optional: Add a colored accent light
    pointLight(50, 25, 100, -200, -100, 200);
}

//U STOPPED HERE. Need to make play/stop, and scroll functionality. Then in css add some sweet text on the right
function draw() {
    userStartAudio(); // Ensure audio context is started
    updateProgressUI();

    // ADD LIGHTING HERE
    // Lighting();

    //Getting mic volume
    // amp = mic.getLevel() * 100
    // amplitudeCoeff = map(amp, 0, 100, 0, 10)

    //Analyzing the song. Use .getEnergy() for specific frequencies
    // like this amp = fft.getEnergy("bass");
    let spectrum = fft.analyze();
    let amp = fft.getEnergy("mid");
    amplitudeCoeff = map(amp, 0, 255, 0, 1);
    // print("spectrum:" + spectrum);
    // print("amp:" + amp);
    // print("amplitudeCoeff:" + amplitudeCoeff);
    // Adjust the range as needed
    

    //Using .waveform() or .analyze()
    // waveform = fft.waveform();
    // print(waveform);

    //Drawing the grid
    background(50, 58, 75);
    orbitControl();
    rotateX(-45);
    rotateY(-45);
    translate(-25, -75, -25);
    
    for (let i=0; i<rows; i++){
        sizes[i] = []
        xOff += inc;
        rect(200, 0, 200, 100); // (x,y,width,height) relative to translate

        for (let j=0; j<cols; j++){
            //Setting the locations for the boxes
            yOff += inc;
            xOff += inc;
            sizes[i][j] = map(noise(xOff, yOff, zOff), 0, 1, 0, size*1.1)

            //Changing the color based on zOff
            let r = noise(zOff) * 255;
            let g = noise(yOff) * 255;
            let b = noise(xOff + 15) * 255;
            fill(r, g, b);
            // fill(50);    
            noStroke();
            // rect(size/2 + i*size, size/2 + j*size, sizes[i][j], sizes[i][j]);

            //Drawing multiple boxes
            push();
            translate(size*i - 100, sizes[i][j] * map(amp, 0, 255, 0.25, 15) * 3, size*j - 100)
            box(size, 300, size)
            pop();
        }
        yOff = 0;
    }
    zOff += 0.003;
    xOff = 0;
}

// To do:
// Functions:
// 1. Tempo is the inc amount for the zOff parameter
// 2. Volume as the box height or amplitudeCoeff (+)
// 3. Camera go down with the box and come closer when it goes down

