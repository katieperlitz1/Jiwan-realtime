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

let ch1;
let ch2;
let ch3;
let ch4;
let ch5;
let ch6;
let ch7;
let ch8;

let modeDropdown;

let accCheckboxes = {};
let gyrCheckboxes = {};

let accThreshold = { x: 1500, y: 1500, z: 1500 }; // default thresholds
let alertTriggered = { x: false, y: false, z: false };

// click markers
let isClicked = false;
let clickCounter = {
  clickInternal: 0,
  clickListener: function (val) {},
  set click(val) {
    this.clickInternal = val;
    this.clickListener(val);
  },
  get click() {
    return this.clickInternal;
  },
  registerListener: function (listener) {
    this.clickListener = listener;
  },
  unregisterListner: function () {
    this.clickListener = function () {
      console.log("No Listener");
    };
  },
};

let sensorHistory = Array(8)
  .fill()
  .map(() => new Array(300).fill(0));
let sensorValues = [0, 0, 0, 0, 0, 0, 0, 0];
let colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "cyan",
  "magenta",
];
let connectionStatus = "Connecting...";
let socket;
let maxValue = 2000;
let minValue = -2000;
let numChannels = 8;
let gridX = 3,
gridY = 3;
let boxSize;
let channelCheckboxes = [];
let labelInputs = [];
let channelLabels = ["Ch1", "Ch2", "Ch3", "Ch4", "Ch5", "Ch6", "Ch7", "Ch8"];
let minInput, maxInput;

function setup() {
  let mainContainer = createDiv();
  mainContainer.style("display", "flex");
  mainContainer.style("flex-direction", "column"); // Stack everything vertically
  mainContainer.style("width", "100%");
  mainContainer.parent(document.body);
  createCanvas(windowWidth - 20, 2500);

  // === Container for all top controls ===
  let topContainer = createDiv();
  topContainer.style("display", "flex");
  topContainer.style("gap", "20px");
  topContainer.style("align-items", "center");
  topContainer.style("padding", "20px");
  topContainer.style("background", "#f5f5f5");
  topContainer.style("border-bottom", "1px solid #ccc");
  topContainer.parent(mainContainer);
  topContainer.style("width", "100%");

  // --- Mode Selection ---
  let modeSection = createDiv();
  modeSection.style("display", "flex");
  modeSection.style("flex-direction", "column");

  let modeLabel = createDiv("Select Mode:");
  modeLabel.style("font-size", "18px");
  modeLabel.style("font-weight", "bold");
  modeLabel.style("margin-bottom", "5px");

  modeDropdown = createSelect();
  modeDropdown.option("IMU");
  modeDropdown.option("Analog");
  modeDropdown.selected("IMU");
  modeDropdown.changed(updateNotificationHandler);
  modeDropdown.style("font-size", "16px");
  modeDropdown.style("padding", "5px");
  modeDropdown.style("width", "180px");

  modeSection.child(modeLabel);
  modeSection.child(modeDropdown);
  topContainer.child(modeSection);

  // --- Subject Number Input ---
  let subjectSection = createDiv();
  subjectSection.style("display", "flex");
  subjectSection.style("flex-direction", "column");

  let subjectLabel = createDiv("Subject Number:");
  subjectLabel.style("font-size", "18px");
  subjectLabel.style("font-weight", "bold");
  subjectLabel.style("margin-bottom", "5px");

  subjectTextView = createInput("9999");
  subjectTextView.attribute("placeholder", "Subject Number");
  subjectTextView.style("font-size", "16px");
  subjectTextView.style("padding", "5px");
  subjectTextView.style("width", "180px");

  subjectSection.child(subjectLabel);
  subjectSection.child(subjectTextView);
  topContainer.child(subjectSection);

  // --- Buttons ---
  connectBtn = createButton("Connect Device");
  connectBtn.mousePressed(bleConnect);
  styleButton(connectBtn);
  topContainer.child(connectBtn);

  recordingBtn = createButton("Start Data Record");
  recordingBtn.mousePressed(handleRecording);
  styleButton(recordingBtn);
  topContainer.child(recordingBtn);

  downloadBtn = createButton("Download Data");
  downloadBtn.mousePressed(downloadCSV);
  styleButton(downloadBtn);
  topContainer.child(downloadBtn);

  restartBtn = createButton("Restart Data Stream");
  restartBtn.mousePressed(restartNotifications);
  styleButton(restartBtn);
  topContainer.child(restartBtn);


  // === Container for channel checkboxes + labels ===
  let channelContainer = createDiv();
  channelContainer.style("margin", "30px 50px");

  for (let i = 0; i < sensorHistory.length; i++) {
    let row = createDiv();
    row.style("display", "flex");
    row.style("align-items", "center");
    row.style("margin-bottom", "10px");
    row.style("gap", "10px");

    let checkbox = createCheckbox(channelLabels[i] || `Ch${i + 1}`, true);
    channelCheckboxes.push(checkbox);

    let input = createInput(`Ch${i + 1}`);
    input.size(150);
    labelInputs.push(input);

    row.child(checkbox);
    row.child(input);
    channelContainer.child(row);
  }

  // === Graph Scale Inputs ===
  let scaleContainer = createDiv();
  scaleContainer.style("margin", "30px 50px");
  scaleContainer.style("display", "flex");
  scaleContainer.style("gap", "20px");
  scaleContainer.style("align-items", "center");

  minInput = createInput("-2000");
  minInput.size(100);
  scaleContainer.child(createDiv("Min Value:"));
  scaleContainer.child(minInput);

  maxInput = createInput("2000");
  maxInput.size(100);
  scaleContainer.child(createDiv("Max Value:"));
  scaleContainer.child(maxInput);

  let updateScaleButton = createButton("Update Graph Scale");
  updateScaleButton.mousePressed(updateScaleRange);
  styleButton(updateScaleButton);
  scaleContainer.child(updateScaleButton);

  // Add containers to page
  channelContainer.parent(mainContainer);
  scaleContainer.parent(mainContainer);

  windowResized();
}
  
  // === Helper function to style buttons ===
  function styleButton(btn) {
    btn.style("font-size", "16px");
    btn.style("padding", "10px 20px");
    btn.style("background-color", "#007BFF");
    btn.style("color", "white");
    btn.style("border", "none");
    btn.style("border-radius", "5px");
    btn.style("cursor", "pointer");
    btn.style("transition", "background 0.3s");
    btn.mouseOver(() => btn.style("background-color", "#0056b3"));
    btn.mouseOut(() => btn.style("background-color", "#007BFF"));
  }


function windowResized() {
  resizeCanvas(windowWidth - 20, 1800);
}

function draw() {
  if (isConnected) {
    updateChannelLabels();
    sensorValues = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8];
    updateSensorHistory();
    background(255);
    let yOffset = 500;
    let padding = 20;

    drawLineChart(0, yOffset, width, 300);
    yOffset += 600 + padding;

    drawVerticalBarChart(0, yOffset, width, 400);
    yOffset += 600 + padding;

    drawHorizontalBarChart(0, yOffset, width, 200);
    yOffset += 250 + padding;

    drawGrid(50, yOffset); // No hardcoded y!
  }
}

function drawLineChart(x, y, w, h) {
  push();
  translate(x, y);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Sensor Data Over Time", w / 2, 20);

  for (let i = 0; i < sensorHistory.length; i++) {
    if (channelCheckboxes[i].checked()) {
      stroke(colors[i % colors.length]);
      noFill();
      beginShape();
      for (let j = 0; j < sensorHistory[i].length; j++) {
        let yVal = map(sensorHistory[i][j], minValue, maxValue, h, 30);
        vertex(j * (w / 300), yVal);
      }
      endShape();
    }
  }

  // Draw legend
  let legendX = 20;
  let legendY = h + 40;
  let spacing = 20;

  for (let i = 0; i < sensorHistory.length; i++) {
    if (channelCheckboxes[i].checked()) {
      fill(colors[i % colors.length]);
      noStroke();
      rect(legendX, legendY + i * spacing, 15, 15);
      fill(0);
      textAlign(LEFT, CENTER);
      text(
        channelLabels[i] || `Channel ${i + 1}`,
        legendX + 20,
        legendY + i * spacing + 7.5
      );
    }
  }
  pop();
}

function drawVerticalBarChart(x, y, w, h) {
  push();
  translate(x, y);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Current Values (Vertical Bars)", w / 2, 0);

  const activeChannels = getActiveChannels();
  let barWidth = w / activeChannels.length;

  for (let i = 0; i < activeChannels.length; i++) {
    let idx = activeChannels[i];
    fill(colors[idx % colors.length]);
    let barHeight = map(sensorValues[idx], minValue, maxValue, 0, h - 40);
    rect(i * barWidth + 10, h - barHeight - 100, barWidth - 20, barHeight);

    fill(0);
    textSize(12);
    text(sensorValues[idx], i * barWidth + barWidth / 2, h - barHeight - 25);
    text(
      channelLabels[idx] || `Channel ${idx + 1}`,
      i * barWidth + barWidth / 2,
      h - 5
    );
  }
  pop();
}

function drawHorizontalBarChart(x, y, w, h) {
  push();
  translate(x, y);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Current Values (Horizontal Bars)", width / 2 - x, 20);
  const activeChannels = getActiveChannels();
  let barHeight = (h - 60) / activeChannels.length;
  let maxBarWidth = w - 120;

  for (let i = 0; i < activeChannels.length; i++) {
    let idx = activeChannels[i];
    fill(colors[idx % colors.length]);
    let barWidth = map(sensorValues[idx], minValue, maxValue, 0, maxBarWidth);
    rect(100, 40 + i * barHeight, barWidth, barHeight * 0.8);

    fill(0);
    textSize(12);
    textAlign(RIGHT);
    text(
      channelLabels[idx] || `Ch ${idx + 1}`,
      90,
      40 + i * barHeight + barHeight / 2
    );
    textAlign(LEFT);
    text(sensorValues[idx], 110 + barWidth, 40 + i * barHeight + barHeight / 2);
  }
  pop();
}

function drawGrid(gridStartX, gridStartY) {
  translate(gridStartX, 0);

  const activeChannels = getActiveChannels();
  let cols = gridX;
  let size = boxSize;

  for (let i = 0; i < activeChannels.length; i++) {
    let idx = activeChannels[i];
    let col = i % cols;
    let row = Math.floor(i / cols);
    let x = col * size;
    let y = gridStartY + row * size;
    let intensity = map(sensorValues[idx], minValue, maxValue, 255, 0);

    fill(intensity);
    stroke(0);
    rect(x, y, size, size);

    fill(intensity < 128 ? 255 : 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(
      channelLabels[idx] || `Ch ${idx + 1}`,
      x + size / 2,
      y + size / 2 - 10
    );
    text(`Value: ${sensorValues[idx]}`, x + size / 2, y + size / 2 + 10);
  }
}

function updateGraph(newValues) {
  for (let i = 0; i < numChannels; i++) {
    sensorHistory[i].shift();
    sensorHistory[i].push(newValues[i] || 0);
    sensorValues[i] = newValues[i] || 0;
  }
}

function handleRecording() {
  if (isRecording) {
    recordingBtn.elt.textContent = "Start Data Record";
    isRecording = false;
  } else {
    recordingBtn.elt.textContent = "Stop Data Record";
    MotionDataArray = [];
    isRecording = true;
  }
}
function updateSensorHistory() {
  for (let i = 0; i < sensorValues.length; i++) {
    sensorHistory[i].shift(); // remove oldest value
    sensorHistory[i].push(sensorValues[i]); // add new value
  }
}

function updateChannelLabels() {
  channelLabels = labelInputs.map((input) => input.value());
}

function updateScaleRange() {
  const min = parseFloat(minInput.value());
  const max = parseFloat(maxInput.value());

  if (!isNaN(min) && !isNaN(max) && min < max) {
    minValue = min;
    maxValue = max;
  } else {
    alert("Please enter valid numerical values where Min < Max.");
  }
}


  function getActiveChannels() {
    return channelCheckboxes
      .map((cb, idx) => cb.checked() ? idx : -1)
      .filter(idx => idx !== -1);
  }