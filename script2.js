let wordData = {};
let mediaRecorder;
let audioChunks = [];
let countdownInterval;
const RECORDING_TIME_IN_SECONDS = 8;  // Set to 3, 6, or 10 as needed


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('file.json');
    const data = await response.json();
    wordData = data.words;
    checkCompletion();  // Ensure this is called to check the default values
  } catch (error) {
    console.error('Error fetching word data:', error);
    alert('Failed to load word data!');
  }
});

function getSelectedValues() {
  return {
    square1: document.getElementById('square1').value,
    square2: document.getElementById('square2').value,
  };
}

function checkCompletion() {
  const selected = getSelectedValues();
  const selectedWords = characterMapping[selected.square1] || [];  // Get the list of words or an empty array if not found
  const selectedWord = selectedWords.find(word => word.endsWith(selected.square2));  // Find the word that ends with the selected square 2 value
  const isInvalidCombination = invalidCombinations.includes(selectedWord + selected.square2);
  const isComplete = Object.values(selected).every(val => val);

  const playBtn = document.getElementById('playBtn');
  const recordBtn = document.getElementById('recordBtn');  // Assuming the record button has an ID of 'recordBtn'

  const shouldBeEnabled = isComplete && !isInvalidCombination && selectedWord;
  playBtn.disabled = !shouldBeEnabled;
  recordBtn.disabled = !shouldBeEnabled;

  if (shouldBeEnabled) {
    updateOutput(selectedWord);
  } else {
    clearOutput();
  }
}


function updateOutput(selectedWord) {
  const wordInfo = wordData[selectedWord];
  if (wordInfo) {
    document.getElementById('combinedWords').textContent = wordInfo.combinedWords;
    document.getElementById('wordImage').src = wordInfo.imagePath;
    document.getElementById('wordImage').alt = selectedWord;
    document.getElementById('playBtn').dataset.audioPath = wordInfo.audioPath; // Store the audio path in a data attribute
  } else {
    clearOutput();
  }
}


function clearOutput() {
  document.getElementById('combinedWords').textContent = '';
  document.getElementById('wordImage').src = '';
  document.getElementById('wordImage').alt = '';
}

function playAudio() {
  const playBtn = document.getElementById('playBtn');
  const audioPath = playBtn.dataset.audioPath;

  if (audioPath) {
    const audio = new Audio(audioPath);
    audio.play();
  } else {
    alert('Audio file not found for the selected combination!');
  }
}

async function initializeRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audioChunks = [];
    };

    return true;
  } catch (error) {
    console.error('Error initializing recording:', error);
    alert('Failed to access microphone. Please ensure you have given the necessary permissions.');
    return false;
  }
}

async function startRecording() {
  if (!mediaRecorder) {
    const isInitialized = await initializeRecording();
    if (!isInitialized) return;
  }

  if (mediaRecorder.state !== 'recording') {
    mediaRecorder.start();
    countdownInterval = showCountdown(RECORDING_TIME_IN_SECONDS); // Use the constant here
    //console.log('Recording started');

    setTimeout(() => {
      stopRecording();
    }, RECORDING_TIME_IN_SECONDS * 1000);  // Use the constant here
  }
}

function showCountdown(seconds) {
  const recordBtn = document.getElementById('recordBtn');
  const originalText = recordBtn.textContent; // Save the original text

  const updateCountdown = () => {
    recordBtn.textContent = `Record (${seconds}s)`;
    seconds -= 1;
    if (seconds < 0) {
      clearInterval(interval);
      recordBtn.textContent = originalText; // Reset the button text when countdown is done
    }
  };

  const interval = setInterval(updateCountdown, 1000);
  updateCountdown(); // Call once immediately to update the button text
  return interval; // Return the interval ID
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(countdownInterval); // Clear the countdown interval
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.textContent = 'Record'; // Reset the button text
  }
}

function recordAudio() {
  startRecording();
}

const invalidCombinations = [
  "bỡi", "cợi", "chời", "chỡi", "chợi", "dới", "dởi", "dỡi", "dợi", "đơi", "đởi", "đỡi", 
  "giơi", "giởi", "giỡi", "giợi", "hới", "hởi",  "khới", "khời", "khỡi", "khợi", "lởi", 
  "lỡi",  "mơi", "mởi", "mỡi", "mợi", "nời", "nởi", "nỡi", 
  "nợi", "ngơi", "ngời", "ngởi", "ngỡi",  "rởi", "rỡi", 
  "rợi", "sơi", "sời", "sỡi",  "trởi", "trỡi", 
  "trợi", "vơi", "với", "vời", "vởi", "vỡi",  "xời", "xởi", 
  "xỡi", "xợi"
];


const characterMapping={
  "b": [
    "Bơi",
    "Bới",
    "Bởi",
    "Bời"
  ],
  "c": [
    "Cơi",
    "cời",
    "Cởi",
    "Chơi",
    "Chới"
  ],
  "d": [
    "Dơi",
    "Dời"
  ],
  "đ": [
    "Đời",
    "Đợi"
  ],
  "g": [
    "Giới",
    "Giời"
  ],
  "h": [
    "Hơi",
    "Hợi",
    "Hời",
    "Hỡi"
  ],
  "k": [
    "Khơi",
    "Khởi"
  ],
  "l": [
    "Lơi",
    "Lời",
    "Lợi"
  ],
  "m": [
    "Mới",
    "Mời"
  ],
  "n": [
    "Nơi",
    "Nới",
    "Ngơi",
    "Ngợi"
  ],
  "r": [
    "Rơi",
    "Rời"
  ],
  "s": [
    "Sợi"
  ],
  "t": [
    "Trời"
  ],
  "v": [
    "Với",
    "Vời"
  ],
  "x": [
    "Xơi",
    "Xới"
  ]
}