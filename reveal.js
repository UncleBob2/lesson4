
class CanvasReveal {
    constructor(characterMapping, canvasId) {
      this.characterMapping = characterMapping;
      this.canvasId = canvasId;
      this.revealedPieces = new Set();
      this.totalPieces = 20;
      this.mappingToPieces = this.createMappingToPieces();
        console.log(`Mapping to pieces: ${JSON.stringify(Array.from(this.mappingToPieces.entries()))}`);

      this.initCanvas();
    }
  
    createMappingToPieces() {
        // Flat map the character keys to create an array of keys
        const keys = Object.keys(this.characterMapping).flatMap(key =>
          this.characterMapping[key].flatMap(word => ({ word, key }))
        );
    
        // Shuffle the array to randomly assign keys to pieces
        for (let i = keys.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }
    
        // Create a map of words to piece indexes
        const mappingToPieces = new Map();
        keys.forEach(({ word, key }, index) => {
          mappingToPieces.set(word, index + 1); // piece indexes are 1-based
        });
    
        return mappingToPieces;
      }
  
    initCanvas() {


      const canvas = document.getElementById(this.canvasId);
      this.ctx = canvas.getContext('2d');
      this.rows = 5;
      this.columns = 4;
      canvas.width = 400;
      canvas.height = 400;
  
      this.pieceWidth = canvas.width / this.columns;
      this.pieceHeight = canvas.height / this.rows;
  
      this.loadImage();
    }

    toString() {
        return `CanvasReveal{revealedPieces: ${Array.from(this.revealedPieces).join(", ")}, totalPieces: ${this.totalPieces}}`;
      }
      
    loadImage() {
      const image = new Image();
      image.src = 'image/award.jpg';
      image.onload = () => {
        this.ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        this.coverAllPieces();
        this.drawGridAndLabels();
      }
    }
  
    coverAllPieces() {
      for (let i = 1; i <= this.totalPieces; i++) {
        this.coverPiece(i);
      }
    }
  
    coverPiece(pieceIndex) {
      const row = Math.floor((pieceIndex - 1) / this.columns);
      const col = (pieceIndex - 1) % this.columns;
  
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(col * this.pieceWidth, row * this.pieceHeight, this.pieceWidth, this.pieceHeight);
    }
  
    drawGridAndLabels() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          const pieceIndex = row * this.columns + col + 1;
  
          this.ctx.strokeStyle = 'black';
          this.ctx.strokeRect(col * this.pieceWidth, row * this.pieceHeight, this.pieceWidth, this.pieceHeight);
  
          this.ctx.fillStyle = 'red';
          this.ctx.font = '16px Arial';
          this.ctx.fillText(pieceIndex, col * this.pieceWidth + 5, row * this.pieceHeight + 20);
        }
      }
    }


    revealPiece(word) {
        // Ensure the word is correctly capitalized as the mapping keys seem case sensitive.
    
        //word = word.charAt(0).toUpperCase() + word.slice(1);
        word = word
        // Check if the word is in the mapping and if it has not already been revealed.
        const pieceIndex = this.mappingToPieces.get(word);
        if (pieceIndex && !this.revealedPieces.has(pieceIndex)) {
          this.removeCover(pieceIndex);
          this.revealedPieces.add(pieceIndex);
        } else {
          // Instead of throwing an error, just log a warning.
          console.warn(`Word: ${word} not found in mapping or already revealed`);
        }
      }
    
      removeCover(pieceIndex) {
        const row = Math.floor((pieceIndex - 1) / this.columns);
        const col = (pieceIndex - 1) % this.columns;
        
        const x = col * this.pieceWidth;
        const y = row * this.pieceHeight;
        
        // Load and draw only the specific part of the image that corresponds to the piece.
        const image = new Image();
        image.src = 'image/award.jpg';  // Make sure this path is correct.
        image.onload = () => {
            // The arguments here are: image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight
            this.ctx.drawImage(image, x, y, this.pieceWidth, this.pieceHeight, x, y, this.pieceWidth, this.pieceHeight);
        };
        window.updateScore(1000);
        
        //console.log(`Piece ${pieceIndex} revealed at (x: ${x}, y: ${y}, width: ${this.pieceWidth}, height: ${this.pieceHeight})`);
    }
    
      
      
    update(word) {
        // Ensure the word is correctly capitalized as the mapping keys seem case sensitive.
        word = word.charAt(0).toUpperCase() + word.slice(1);
        //word = word
        // Check if the word is in the class's mapping and if it has not already been revealed.
        const pieceIndex = this.mappingToPieces.get(word);
        if (pieceIndex && !this.revealedPieces.has(pieceIndex)) {
          this.revealPiece(word);  // This will call removeCover internally and update the set of revealed pieces.
          console.log(`Piece number ${pieceIndex} revealed for word "${word}".`);
        } else {
          console.log(`the update "${word}" not found in the mapping or already revealed.`);
        }
      
        // Check if all pieces have been revealed
        if (this.isComplete()) {
            updateScore(10000000);
          // Handle game completion (e.g., display a message or trigger an event)
          console.log("All pieces have been revealed! Game complete!");
        }
      }
  
    isComplete() {
      return this.revealedPieces.size === this.totalPieces;
    }
  }
  
  // Export the CanvasReveal class for use in script.js
  export default CanvasReveal;
  