// Initialize global variables
let wordData = {};
let mediaRecorder;
let audioChunks = [];
let countdownInterval;
let currentAudio;

const RECORDING_TIME_IN_SECONDS = 8;
let playerState = 'idle';



const characterMapping = {
  "b": ["Bơi", "Bởi"],
  "c": ["Cỡi", "Cởi"],
  "ch": ["Chơi"],
  "d": ["Dơi", "Dời"],
  "đ": ["Đời", "Đợi"],
  "gi": ["Giới"],
  "tr": ["Trời"],
  "kh": ["Khởi"],
  "l": ["Lời", "Lợi"],
  "m": ["Mới", "Mời"],
  "ng": ["Ngơi", "Ngợi"],
  "r": ["Rơi"],
  "s": ["Sợi"]
}
    

// Event listener for when the DOM content has loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize event listeners for permission modal buttons
  document.getElementById('allowBtn').addEventListener('click', handleAllowClick);
  document.getElementById('denyBtn').addEventListener('click', handleDenyClick);
  
  // Add change event listeners to dropdowns to stop audio when a new character is selected
  document.getElementById('square1').addEventListener('change', stopAudio);
  document.getElementById('square2').addEventListener('change', stopAudio);

  // Fetch word data and initialize the app
  try {
    const response = await fetch('file.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    wordData = data.words;
  } catch (error) {
    console.error('Error fetching word data:', error);
    alert('Failed to load word data!');
  }
  
  // Initialize the app based on user's previous choice
  initializeApp();
  checkCompletion(); // Ensure this is called after the DOM is ready
  animate(ctx);
});

// Function to stop audio
function stopAudio() {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

function initializeApp() {
  const userChoice = localStorage.getItem('userChoice');
  if (userChoice === 'allowed') {
    console.log('App initialized');
  } else if (!userChoice) {
    document.getElementById('permissionModal').style.display = 'block'; 
  } else {
    console.log('User has denied microphone access');
  }
}



// Handle allow button click for microphone permission
async function handleAllowClick() {
  document.getElementById('permissionModal').style.display = 'none';
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    // Initialize audio context to ensure microphone access works
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
    // Save user's choice
    localStorage.setItem('userChoice', 'allowed');
    initializeApp();
  } catch (error) {
    console.error('Error initializing microphone:', error);
    alert('Failed to access microphone. Please ensure you have given the necessary permissions.');
  }
}

// Handle deny button click for microphone permission
function handleDenyClick() {
  document.getElementById('permissionModal').style.display = 'none';
  localStorage.setItem('userChoice', 'denied');
}

// Get selected values from dropdowns
function getSelectedValues() {
  return {
    square1: document.getElementById('square1').value,
    square2: document.getElementById('square2').value,
  };
}


// Check if the selected combination is complete and valid
function checkCompletion() {
  const selected = getSelectedValues();
  const selectedWords = characterMapping[selected.square1] || [];
  const selectedWord = selectedWords.find(word => word.endsWith(selected.square2));
  const isComplete = Object.values(selected).every(val => val);

  const playBtn = document.getElementById('playBtn');
  const recordBtn = document.getElementById('recordBtn');

  const shouldBeEnabled = isComplete && selectedWord;
  playBtn.disabled = !shouldBeEnabled;
  recordBtn.disabled = !shouldBeEnabled;

  if (shouldBeEnabled) {
    updateOutput(selectedWord);
    updatePlayerState(getRandomState()); // Update to a random state
  } else {
    clearOutput();
    updatePlayerState('idle');
  }
}


function getRandomState() {
  const states = ['idle', 'jump', 'fall', 'run', 'dizzy', 'sit', 'roll'];
  const randomIndex = Math.floor(Math.random() * states.length);
  return states[randomIndex];
}

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  let position = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length;
  let frameX = spriteWidth * position;
  let frameY = spriteAnimations[playerState].loc[position].y;

  ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

  gameFrame++;
  requestAnimationFrame(animate);
};


function updatePlayerState(newState) {
  playerState = newState;
}

// Update output elements with word information
function updateOutput(selectedWord) {
  const wordInfo = wordData[selectedWord];
  if (wordInfo) {
    document.getElementById('combinedWords').textContent = wordInfo.combinedWords;
    document.getElementById('wordImage').src = wordInfo.imagePath;
    document.getElementById('wordImage').alt = selectedWord;
    document.getElementById('playBtn').dataset.audioPath = wordInfo.audioPath;
  } else {
    clearOutput();
  }
}

// Clear output elements
function clearOutput() {
  document.getElementById('combinedWords').textContent = '';
  document.getElementById('wordImage').src = '';
  document.getElementById('wordImage').alt = '';
}

// Play audio for the selected combination
function playAudio() {
  const playBtn = document.getElementById('playBtn');
  const audioPath = playBtn.dataset.audioPath;

  // Stop current audio if it's playing
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Play new audio
  if (audioPath) {
    currentAudio = new Audio(audioPath);
    currentAudio.play();
  } else {
    alert('Audio file not found for the selected combination!');
  }
}

// Initialize recording
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

// Start recording audio
async function startRecording() {
  if (!mediaRecorder) {
    const isInitialized = await initializeRecording();
    if (!isInitialized) return;
  }

  if (mediaRecorder.state !== 'recording') {
    mediaRecorder.start();
    countdownInterval = showCountdown(RECORDING_TIME_IN_SECONDS);
    setTimeout(() => {
      stopRecording();
    }, RECORDING_TIME_IN_SECONDS * 1000);
  }
}

// Show countdown during recording
function showCountdown(seconds) {
  const recordBtn = document.getElementById('recordBtn');
  const originalText = recordBtn.textContent;

  const updateCountdown = () => {
    recordBtn.textContent = `Record (${seconds}s)`;
    seconds -= 1;
    if (seconds < 0) {
      clearInterval(interval);
      recordBtn.textContent = originalText;
    }
  };

  const interval = setInterval(updateCountdown, 1000);
  updateCountdown();
  return interval;
}

// Stop recording audio
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(countdownInterval);
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.textContent = 'Record';
  }
}



async function recordAudio() {
  try {
    await startRecording();
  } catch (error) {
    console.error('Error starting recording:', error);
  }
}



// script.js
window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas3');
  const ctx = canvas.getContext('2d');
  const rows = 5;
  const columns = 4;
  canvas.width = 400; // Set the desired width
  canvas.height = 400; // Set the desired height

  const pieceWidth = canvas.width / columns;
  const pieceHeight = canvas.height / rows;

  // Function to generate an array with 3 unique random numbers between 1 and 20
  function generateRandomNumbers() {
      let arr = [];
      while (arr.length < 3) {
          var r = Math.floor(Math.random() * 20) + 1;
          if (arr.indexOf(r) === -1) arr.push(r);
      }
      return arr;
  }

  // Function to cover a piece on the canvas
  function coverPiece(pieceIndex) {
      // Calculate the row and column from the piece index
      const row = Math.floor((pieceIndex - 1) / columns);
      const col = (pieceIndex - 1) % columns;

      // Fill the piece with a semi-transparent black rectangle
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
  }

  const image = new Image();
  image.src = 'image/trophy.jpg'; // Make sure the path is correct
  image.onload = function() {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      drawGridAndLabels();

      // Get the random pieces to cover and cover them
      const randomPiecesToCover = generateRandomNumbers();
      randomPiecesToCover.forEach(piece => coverPiece(piece));
  }

  function drawGridAndLabels() {
      for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
              // Calculate the piece index (1-based)
              const pieceIndex = row * columns + col + 1;

              // Draw dividing lines
              ctx.strokeStyle = 'black';
              ctx.strokeRect(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);

              // Label the piece
              ctx.fillStyle = 'red';
              ctx.font = '16px Arial';
              ctx.fillText(pieceIndex, col * pieceWidth + 5, row * pieceHeight + 20);
          }
      }
  }
});

