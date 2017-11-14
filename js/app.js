// All the tiles, ready to be mixed up later on
var inputArray = ['bug', 'bug', 'sphere', 'sphere', 'smile', 'smile', 'code', 'code', 'terminal', 'terminal', 'stackoverflow', 'stackoverflow', 'firefox', 'firefox', 'git', 'git'];
var moveCounter,
    timeCounter,
    starCounter,
    gameTimer,
    moves = 0,
    matches = 0,
    stars = 3,
    rating = '★★★',
    time = 0,
    activeTiles = [];

// Wait for page to load before initializing:
window.addEventListener('load', init, false);

function init(){
  moveCounter = document.getElementById('move-count');
  timeCounter = document.getElementById('elapsedtime');
  starCounter = document.getElementById('stars');

  document.getElementById('field').addEventListener('click', flipTile, false);
  document.getElementById('reset').addEventListener('click', resetGame, false);
  document.getElementById('hooray').addEventListener('click', closePopup, false);

  newGame();
  konami();
}

function checkForWin(){
  if(matches === 8){
    timer(gameTimer);
    openPopup();
  }
}

function openPopup(){
  var popup = document.getElementById('hooray');
  popup.children[1].innerHTML = `With ${moves} moves,<br>in ${timeCounter.textContent}<br>you scored <span class="stars">${rating}</span>!`;
  popup.classList.add('show');
}

function closePopup(e){
  if(e.target && e.target.nodeName === 'BUTTON') {
    if(e.target.id === 'playagain'){
      resetGame();
    }
    this.classList.remove('show');
  }
}

function updateStarRating(){
  if(moves < 32 && moves > 24){
    stars = 2;
    rating = '★★☆';
  } else if (moves < 40 && moves >= 32) {
    stars = 1;
    rating = '★☆☆';
  } else if (moves >= 40) {
    stars = 1;
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
    var numActiveTiles = activeTiles.length;
    e.target.parentNode.classList.toggle('flipped');

    updateMoves(1);
    updateStarRating();
    if(numActiveTiles === 0){
      activeTiles.push(e.target.parentNode);
    } else if (numActiveTiles === 1) {
      activeTiles.push(e.target.parentNode);

      // Test for match:
      var pictureOne = activeTiles[0].lastElementChild.dataset.tilePicture;
      var pictureTwo = activeTiles[1].lastElementChild.dataset.tilePicture;

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
          var openTiles = arrayOf(document.getElementsByClassName('flipped'));
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
  moves = 0;
  matches = 0;
  stars = 3;
  rating = '★★★';
  emptyTileVariables();
  updateStarRating();
  updateMoves(0);
  timer(gameTimer);

  // Gather all the tiles that are turned with the image up
  var flippedTiles = arrayOf(document.getElementsByClassName('flipped'));
  var successTiles = arrayOf(document.getElementsByClassName('success'));
  // source https://jsperf.com/merge-two-arrays-keeping-only-unique-values
  var openTiles = successTiles.concat(flippedTiles.filter(function(i) {
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

  // Start a new game, but wait untill the tiles have turned back, so you can't see the new images allready
  setTimeout(function(){
    newGame();
  }, 600);
}

function newGame(){
  // - Shuffle cards randomly
  var randomArray = shuffleArray(inputArray);
  // make array of all tiles
  var tiles = document.querySelectorAll('.tile');
  var tileArray = arrayOf(tiles);
  // set data element for each tile
  tileArray.forEach(function(tile, index){
    var backside = tile.getElementsByClassName('back')[0];
    backside.dataset.tilePicture = randomArray[index];
  });
  // Start the timer for this game
  gameTimer = timer('start');
}

function updateMoves(n){
  moves += n;
  moveCounter.textContent = moves;
}

function timer(cmnd){
  if(cmnd === 'start'){
    var timer = setInterval(function(){
      time++;
      displayTime(time);
    }, 1000);
    return timer;
  } else {
    clearInterval(cmnd);
    time = 0;
  }
}

function displayTime(timeInSeconds){
  var minutesInDecimal = timeInSeconds/60;
  var secondsInDecimal = (minutesInDecimal % 1);
  var fullMinutes = minutesInDecimal - secondsInDecimal;
  var fullSeconds = Math.floor(secondsInDecimal * 60);
  var display = (fullMinutes < 10 && fullMinutes >= 0 ? '0' + fullMinutes : fullMinutes) + ':' + (fullSeconds < 10 && fullSeconds >= 0 ? '0' + fullSeconds : fullSeconds);
  timeCounter.textContent = display;
}

function shuffleArray(arr){
  // source: http://osric.com/chris/accidental-developer/2012/07/javascript-array-sort-random-ordering/
  var arrayIn = arr.slice(0);
  var n = arrayIn.length;
  var newArr = [];
  for(var i=0; i < n-1; i++) {
    newArr.push(arrayIn.splice(Math.floor(Math.random()*arrayIn.length),1)[0]);
  }
  newArr.push(arrayIn);
  return newArr;
}

function arrayOf(arrayLike){
  // source: https://jsperf.com/convert-nodelist-to-array
  var newArray = new Array(arrayLike.length);
  var arrayLikeLength = arrayLike.length;
  while(arrayLikeLength) {
    arrayLikeLength--;
    newArray[arrayLikeLength] = arrayLike[arrayLikeLength];
  }
  return newArray;
}

function konami(){
  // source: https://gist.github.com/hugocaillard/265592c3783a4eb2525f.js
  var patern = '38384040373937396665';
  var code = '', delta = 0;
  window.addEventListener('keyup', function(e) {
    code+=e ? e.keyCode : event.keyCode;
    delta = code.length-patern.length;
    if (delta>=0) code = code.substring(delta);
    if (code===patern){
      var tileArray = arrayOf(document.querySelectorAll('.tile'));

      tileArray.forEach(function(tile, index){
        var frontside = tile.getElementsByClassName('front')[0];
        var picture = tile.getElementsByClassName('back')[0].dataset.tilePicture;
        frontside.dataset.tilePicture = picture;
      });

    }
    // Add option to stop timer manually
    if(e.key === 'p' || e.keyCode === 80){ timer(gameTimer); }
  });
}
