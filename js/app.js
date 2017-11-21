// All the tiles, ready to be mixed up later on
const inputArray = ['bug', 'bug', 'sphere', 'sphere', 'smile', 'smile', 'code', 'code', 'terminal', 'terminal', 'stackoverflow', 'stackoverflow', 'firefox', 'firefox', 'git', 'git'];
let moveCounter,
    timeCounter,
    starCounter,
    gameTimer,
    resetBtn,
    moves = 0,
    matches = 0,
    numstars = 3,
    rating = '★★★',
    time = 0,
    activeTiles = [];

// Wait for page to load before initializing:
window.addEventListener('load', init, false);

function init(){
  moveCounter = document.getElementById('move-count');
  timeCounter = document.getElementById('elapsedtime');
  starCounter = document.getElementById('stars');
  resetBtn = document.getElementById('reset');

  // listen for clicks in the playing field instead of on all the seperate tiles.
  // determining wether the user clicked on a tile is done in the flipTile function.
  document.getElementById('field').addEventListener('click', flipTile, false);
  // make the reset button functional, the element is put in a variable because
  // it is used in a different place of the program as well
  resetBtn.addEventListener('click', resetGame, false);
  // make the buttons in the congratulatory popup functional
  document.getElementById('hooray').addEventListener('click', closePopup, false);

  newGame();
  konami();
}

function checkForWin(){
  // if the user has matched all 8 pairs, the game is over
  if(matches === 8){
    // stop the timer
    timer(gameTimer);
    openPopup();
  }
}

function openPopup(){
  const popup = document.getElementById('hooray');
  // fill in all the details about the game in the popup
  popup.children[1].innerHTML = `With ${moves} moves,<br>in ${timeCounter.textContent}<br>you scored <span class="stars">${rating}</span>!`;
  // open the popup
  popup.classList.add('show');
}

function closePopup(e){
  // if the user clicked on one of the buttons
  if(e.target && e.target.nodeName === 'BUTTON') {
    // if the user choose to play again
    if(e.target.id === 'playagain'){
      // …start a new game
      resetGame();
    }
    // close the popup
    this.classList.remove('show');
  }
}

function updateStarRating(){
  if(moves < 16 && moves > 12){
    numstars = 3;
    rating = '★★★';
  } else if (moves < 20 && moves >= 16) {
    numstars = 2;
    rating = '★★☆';
  } else if (moves >= 20) {
    numstars = 1;
    rating = '★☆☆';
  }

  starCounter.textContent = rating;
}

function emptyTileVariables(){
  activeTiles.length = 0;
}

function flipTile(e){
  // If the user clicked on a tile that is not turned over yet
  // and as long as it is his first or second turn for this round,
  // proceed to flip the tile
  if(e.target && e.target.nodeName === 'FIGURE' && e.target.nextElementSibling && activeTiles.length < 2) {
    const numActiveTiles = activeTiles.length;
    e.target.parentNode.classList.toggle('flipped');

    if(numActiveTiles === 0){
      // register this tile as one of the tiles the user selected
      activeTiles.push(e.target.parentNode);
      // Start the timer for this game if this is the first card clicked on
      if(!gameTimer) gameTimer = timer('start');
    } else if (numActiveTiles === 1) {
      // register this tile as one of the tiles the user selected
      activeTiles.push(e.target.parentNode);

      updateMoves(1);
      updateStarRating();

      // Test if the two selected tiles are the same:
      // --------------------------------------------
      const pictureOne = activeTiles[0].lastElementChild.dataset.tilePicture;
      const pictureTwo = activeTiles[1].lastElementChild.dataset.tilePicture;

      if(pictureOne === pictureTwo){
        // Tiles are the same! :D
        matches++;
        setTimeout(function(){
          // classList.replace('old', 'new') would be nicer,
          // but is not as well supported…
          activeTiles[0].classList.add('success');
          activeTiles[1].classList.add('success');
          activeTiles[0].classList.remove('flipped');
          activeTiles[1].classList.remove('flipped');
          checkForWin();
          emptyTileVariables();
        }, 600);

      } else {
        // Tiles are different
        setTimeout(function(){
          const openTiles = arrayOf(document.getElementsByClassName('flipped'));
          openTiles.forEach(function(t){
            t.classList.toggle('flipped');
          });
          emptyTileVariables();
        }, 900);
      }
    }
  }
}

function resetGame(){
  resetBtn.setAttribute("disabled", "");
  moves = 0;
  matches = 0;
  numstars = 3;
  rating = '★★★';
  emptyTileVariables();
  updateStarRating();
  updateMoves(0);
  timer(gameTimer);
  displayTime(0);

  // Gather all the tiles that are turned with the image up
  const flippedTiles = arrayOf(document.getElementsByClassName('flipped'));
  const successTiles = arrayOf(document.getElementsByClassName('success'));
  // source https://jsperf.com/merge-two-arrays-keeping-only-unique-values
  const openTiles = successTiles.concat(flippedTiles.filter(function(i) {
    return successTiles.indexOf(i) == -1;
  }));

  // Turn all the open tiles back with the image side down
  openTiles.forEach(function(t){
    t.classList.remove('success');
    t.classList.remove('flipped');
  });

  // Remove all the images from the tiles
  arrayOf(document.getElementsByClassName('tile')).forEach(function(tile, index){
    tile.getElementsByClassName('front')[0].removeAttribute('data-tile-picture');
  });

  // Start a new game, but wait untill the tiles have turned back,
  // so you can't see the new images allready
  setTimeout(function(){
    newGame();
    resetBtn.removeAttribute("disabled", "");
  }, 600);
}

function newGame(){
  // - Shuffle cards randomly
  const randomArray = shuffleArray(inputArray);
  // make array of all tiles
  const tiles = document.querySelectorAll('.tile');
  let tileArray = arrayOf(tiles);
  // set data element for each tile
  tileArray.forEach(function(tile, index){
    const backside = tile.getElementsByClassName('back')[0];
    backside.dataset.tilePicture = randomArray[index];
  });
}

function updateMoves(n){
  moves += n;
  moveCounter.textContent = moves;
}

function timer(cmnd){
  // if the function receives a 'start' command, create and start a new timer
  if(cmnd === 'start'){
    let timer = setInterval(function(){
      time++;
      displayTime(time);
    }, 1000);
    return timer;
  }
  // else, the function received a timer and that timer will be stopped
  else {
    clearInterval(cmnd);
    gameTimer = 0;
    time = 0;
  }
}

function displayTime(timeInSeconds){
  // convert a number of seconds to a displayable time in the format mm:ss
  const minutesInDecimal = timeInSeconds/60;
  const secondsInDecimal = (minutesInDecimal % 1);
  const fullMinutes = minutesInDecimal - secondsInDecimal;
  const fullSeconds = Math.floor(secondsInDecimal * 60);
  const display = (fullMinutes < 10 && fullMinutes >= 0 ? '0' + fullMinutes : fullMinutes) + ':' + (fullSeconds < 10 && fullSeconds >= 0 ? '0' + fullSeconds : fullSeconds);

  timeCounter.textContent = display;
}

function shuffleArray(arr){
  // shuffle the provided array randomly and return the randomly ordered array
  // source: http://osric.com/chris/accidental-developer/2012/07/javascript-array-sort-random-ordering/
  let arrayIn = arr.slice(0);
  const n = arrayIn.length;
  let newArr = [];
  for(let i=0; i < n-1; i++) {
    newArr.push(arrayIn.splice(Math.floor(Math.random()*arrayIn.length),1)[0]);
  }
  newArr.push(arrayIn);
  return newArr;
}

function arrayOf(arrayLike){
  // convert an array-like object to an array and return the latter
  // source: https://jsperf.com/convert-nodelist-to-array
  let newArray = new Array(arrayLike.length);
  let arrayLikeLength = arrayLike.length;
  while(arrayLikeLength) {
    arrayLikeLength--;
    newArray[arrayLikeLength] = arrayLike[arrayLikeLength];
  }
  return newArray;
}

function konami(){
  // when the user enters the konami code…
  // source: https://gist.github.com/hugocaillard/265592c3783a4eb2525f.js
  const patern = '38384040373937396665';
  let code = '', delta = 0;
  window.addEventListener('keyup', function(e) {
    code+=e ? e.keyCode : event.keyCode;
    delta = code.length-patern.length;
    if (delta>=0) code = code.substring(delta);
    if (code===patern){
      let tileArray = arrayOf(document.querySelectorAll('.tile'));

      // …do something.
      // in this case, let the user see through the tiles
      tileArray.forEach(function(tile, index){
        const frontside = tile.getElementsByClassName('front')[0];
        const picture = tile.getElementsByClassName('back')[0].dataset.tilePicture;
        frontside.dataset.tilePicture = picture;
      });

    }
    // When the user presses the 'p' key, stop the running timer
    if(e.key === 'p' || e.keyCode === 80){ timer(gameTimer); }
  });
}
