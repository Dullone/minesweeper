var minesweeper = (function() {
  init = function() {
    newGame();

    $('#reset').click(newGame);
  };

  var newGame = function()
  {
    //game.init();
    board.init();
    //boardView.init();
  };

  var game = ( function() {

  })();

  var board = ( function() {
    var sizeX;
    var sizeY;
    var _mines;
    var _board_array = [];

    var _empty = 'empty';
    var _mine  = 'mine';
    var _flag  = 'flag';

    var init = function(options) {
      options = options || {};
      sizeX = options.sizeX  || 9;
      sizeY = options.sizeY  || 9;
      _mines = options.mines || 10;
      createBoard();
    };

    var createBoard = function() {
      //create empty board
      for (var i = 0; i < sizeX; i++) {
        _board_array [i] = [];
        for (var j = 0; j < sizeX; j++) {
          _board_array[i][j] = _empty;
        }  
      }

      addMines(_mines);
      console.log(_board_array);
    };

    var addMines = function(mines) {
      if (emptySquares() < mines) {
        return false;
      }
      for (var i = 1; i  <= _mines; i++) {
        var x = Math.floor(Math.random() * sizeX);
        var y = Math.floor(Math.random() * sizeX);
        
        if(squareEmpty([x,y])) {
          _board_array[x][y] = new Square('mine');
        } else { //mine wasn't placed, place another
          i--;
        }

      }
    };

    var squareEmpty =  function(loc) {
      return (_board_array[loc[0]][loc[1]] === _empty );
    };

    var emptySquares = function(loc) {
      var empty = 0;
      for (var i = 0; i < sizeX; i++) {
        for (var j = 0; j < sizeX; j++) {
          if(squareEmpty([i,j])) {
            empty++;
          }
        }  
      }
      return empty;
    };

    var Square = function(type) {
      this.type = type;
      this.revealed = false;

      var reveal = function() {
        this.revealed = true;
      };
    };

    return {
      init: init,
    }

  })();

  var boardView = ( function() {

  })();

  return{
    init:init,
  }

})();

$(minesweeper.init());