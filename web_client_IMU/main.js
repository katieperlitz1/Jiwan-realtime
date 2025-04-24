let myBLE = new p5ble();
let isConnected = false;

const serviceUUID      = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const txCharacteristic = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const rxCharacteristic = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// rxData
let myValue = 0;

// variables for the display of the data
let SHOW_ACC = 0;
let SHOW_GYR = 1;
let SHOW_MAG = 2;
let chart = SHOW_ACC;

// text
let textDelay = 1000/5; 
let lastTextms = 0; 

// drawing
let offscreen; 
let xPos = 0;                           // x position of the graph
let chartData = [0, 0, 0, 0,   0, 0, 0, 0];

/*
 * UI elements
 */
let connectBtn;
let recordingBtn;
let playBtn;
let startInHandBtn;
let startTableTopBtn;
let downloadBtn;
let trialInitBtn;

// data save
let currentTrial=0;
let currentBlock=0;
let currentCondition=0;
let currentGesture=0;
let MotionDataArray = [];
let SoundDataArray = [];
let isRecording = false;
let trialSet = [];
let acc_x;
let acc_y;
let acc_z;
let gyr_x;
let gyr_y;
let gyr_z;

let accCheckboxes = {};
let gyrCheckboxes = {};

let accThreshold = { x: 1500, y: 1500, z: 1500 }; // default thresholds
let alertTriggered = { x: false, y: false, z: false };

// click markers
let isClicked = false;
let clickCounter = {
  clickInternal: 0,
  clickListener: function(val) {},
  set click(val) {
    this.clickInternal = val;
    this.clickListener(val);
  },
  get click() {
    return this.clickInternal;
  },
  registerListener: function(listener) {
    this.clickListener = listener;
  },
  unregisterListner: function() {
    this.clickListener = function() {console.log("No Listener");}
  }
}

/*
 * Setup - config graphics.  
 */
function setup() {
    // Create UI
    connectBtn = createButton('Connect Device') 
    connectBtn.mousePressed(bleConnect); 

    recordingBtn = createButton('Start Data Record') 
    recordingBtn.mousePressed(handleRecording); 

    downloadBtn = createButton('Download Data');
    downloadBtn.mousePressed(downloadCSV);


    subjectTextView = document.createElement('input');
    subjectTextView.name = 'subjectTextView';
    subjectTextView.type = 'text';
    subjectTextView.value = '9999';
    subjectTextView.placeholder = "subject number";

    // Axis checkboxes
    accCheckboxes.x = createCheckbox('Acc X', true);
    accCheckboxes.y = createCheckbox('Acc Y', true);
    accCheckboxes.z = createCheckbox('Acc Z', true);

    gyrCheckboxes.x = createCheckbox('Gyr X', true);
    gyrCheckboxes.y = createCheckbox('Gyr Y', true);
    gyrCheckboxes.z = createCheckbox('Gyr Z', true);

    const checkboxBaseY = height + 20;

    accCheckboxes.x.position(20, checkboxBaseY);
    accCheckboxes.y.position(100, checkboxBaseY);
    accCheckboxes.z.position(180, checkboxBaseY);

    gyrCheckboxes.x.position(20, checkboxBaseY + 30);
    gyrCheckboxes.y.position(100, checkboxBaseY + 30);
    gyrCheckboxes.z.position(180, checkboxBaseY + 30);

    accThresholdSliders = {
      x: createSlider(0, 4000, 1500),
      y: createSlider(0, 4000, 1500),
      z: createSlider(0, 4000, 1500)
    };
    
    accThresholdSliders.x.position(300, checkboxBaseY);
    accThresholdSliders.y.position(300, checkboxBaseY + 30);
    accThresholdSliders.z.position(300, checkboxBaseY + 60);
    
    accThresholdSliders.x.style('width', '150px');
    accThresholdSliders.y.style('width', '150px');
    accThresholdSliders.z.style('width', '150px');

    // resize the window and hide ui (as we are disconnected)
    windowResized();
    drawTextIntro();

    offscreen = createGraphics(width/5*4,height/5*3); // create offscreen buffer
    offscreen.background(200);
    offscreen.stroke(128); 
    offscreen.noFill(); 
    offscreen.rect(0, 0, offscreen.width, offscreen.height);
    
}

/*
 * Draw - most of the text content in the UI is manually drawn here. This is a bit messy. Use html objects? 
 */
function draw() {     
  let bWidth = windowWidth / 4;  
  let gGap   = bWidth / 4; 
  let hGap   = max(30, windowHeight / 20);  
  let now = millis();

  accThreshold.x = accThresholdSliders.x.value();
  accThreshold.y = accThresholdSliders.y.value();
  accThreshold.z = accThresholdSliders.z.value();

  if (now - lastTextms>textDelay) {
    drawTextIntro();
    lastTextms = millis(); 
  }
  
  if (isConnected) {
    console.log(acc_x + ", " + acc_y + ", " + acc_z);
    
    if (chart == SHOW_ACC) {
      if (accCheckboxes.x.checked()) graphData(acc_x, 0, 0);
      if (accCheckboxes.y.checked()) graphData(acc_y, 1, 0);
      if (accCheckboxes.z.checked()) graphData(acc_z, 2, 0);
    }
    else if (chart == SHOW_GYR) {
      if (gyrCheckboxes.x.checked()) graphData(gyr_x, 0, 1);
      if (gyrCheckboxes.y.checked()) graphData(gyr_y, 1, 1);
      if (gyrCheckboxes.z.checked()) graphData(gyr_z, 2, 1);
    }
    image(offscreen, width/10, height-offscreen.height-50);

    // at the edge of the screen, go back to the beginning:
    if (xPos >= offscreen.width) {
        xPos = 1;
        // clear the screen by resetting the background: 
        offscreen.background(200); 
        offscreen.stroke(128); 
        offscreen.noFill(); 
        offscreen.rect(0, 0, offscreen.width, offscreen.height);
    } else {
        // increment the horizontal position for the next reading:
        xPos+=2;
    }
  }
  
}

/*
 * should resize on mobile - todo: TEST
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  let bWidth = windowWidth / 4;  
  let gGap   = bWidth / 4; 
  let hGap   = max(30, windowHeight / 20);
  let termY  = 3;
  
  connectBtn.position(gGap, hGap*2);
  connectBtn.size(bWidth);  
  
  recordingBtn.position(gGap*2 + bWidth, hGap*2);
  recordingBtn.size(bWidth);
  
  downloadBtn.position(gGap*3 + bWidth*2, hGap*2);
  downloadBtn.size(bWidth); 
  
  subjectTextView.style.position = 'absolute';
  subjectTextView.style.left = gGap*3 + bWidth*2;
  subjectTextView.style.top = hGap;
  subjectTextView.style.width = bWidth;
  document.body.appendChild(subjectTextView);
}

function drawTextIntro() {
    let bWidth = windowWidth / 4;  
    let gGap   = bWidth / 4; 
    let hGap   = max(30, windowHeight / 20);  
    
    background(200); 
    fill(0);
    textSize(24); 
    textAlign(CENTER, CENTER);
    text("BLE UART IMU SERVER", width/2, hGap);
    textAlign(LEFT, CENTER);
    textSize(18); 
}

function graphData(newData, index, range) {
    // map the range of the input to the window height:
    if (range == 0) {
      yPos = map(newData, -2000, 2000, 0, offscreen.height);
    } else {
      yPos = map(newData, -2000, 2000, 0, offscreen.height);
    }
       
    switch (index) {
      case 0 : offscreen.stroke(255, 0, 0); break;
      case 1 : offscreen.stroke(0, 255, 0); break;
      case 2 : offscreen.stroke(0, 0, 255); break;
      case 3 : offscreen.stroke(0, 0, 0  ); break;
      case 4 : offscreen.stroke(128, 0, 0); break;
      case 5 : offscreen.stroke(0, 128, 0); break;
      case 6 : offscreen.stroke(0, 0, 128); break;
      case 7 : offscreen.stroke(128, 128, 128  ); break;
    }
    
    offscreen.strokeWeight(5); 

    offscreen.line(xPos-1, offscreen.height - chartData[index], xPos, offscreen.height - yPos);
    chartData[index] = yPos;

    // Real-time threshold alert
    if (chart === SHOW_ACC) {
      const axis = index === 0 ? 'x' : index === 1 ? 'y' : index === 2 ? 'z' : null;
      const dataVal = newData;

      if (axis && Math.abs(dataVal) > accThreshold[axis]) {
        alertTriggered[axis] = true;
        offscreen.fill(255, 0, 0);
        offscreen.noStroke();
        offscreen.ellipse(xPos, offscreen.height - yPos, 10, 10);

        // Optionally play beep or flash bg
        console.log(`⚠️ Threshold exceeded on ${axis.toUpperCase()}: ${dataVal}`);
      } else {
        alertTriggered[axis] = false;
      }
    }
}

function handleRecording() {
    if (isRecording) {
        recordingBtn.elt.textContent = 'Start Data Record'
        isRecording = false;
    } else {
        recordingBtn.elt.textContent = 'Stop Data Record'
        MotionDataArray = [];
        isRecording = true;
    }
}

