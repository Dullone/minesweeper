var minesweeper = (function() {
  init = function() {
    newGame();

    $('#reset').click(newGame);
  };

  var newGame = function()
  {
    game.init();
  };

  var game = ( function() {
    var init = function() {
      var options = {
        sizeX: 9,
        sizeY: 9,
        mines: 10,
      }
      board.init(options);
      boardView.init(options);

      boardView.createBoard(options.sizeX, options.sizeY);
      board.createBoard(options.sizeX, options.sizeY);

      registerClicks();
    };

    var registerClicks = function() {
      console.log(this);
      $('#board .board-square').click(leftClick.bind(this));
      $('#board .board-square').mousedown(rightClick.bind(this));
      //disable context menu for board
      $('#board').on('contextmenu', function(event) {
          event.preventDefault();
        });
    };

    var leftClick = function(event) {

    };

    var rightClick = function(event) {
      if(event.which != 3)
      {
        return;
      }
      var id = event.currentTarget.id;
      board.toggleFlag(idToRowColumn(id));
      boardView.toggleFlag(id);
    };

    var rowColumnToId = function(x, y) {
      return 'r' + x + 'c' + y;
    };

    var idToRowColumn = function(id) {
      return [Number(id.charAt(1)), Number(id.charAt(3))];
    };

    return { //game
      init: init,
      rowColumnToId: rowColumnToId,
    }

  })();

  var board = ( function() {
    var _sizeX;
    var _sizeY;
    var _mines;
    var _board_array = [];

    var _empty = 'empty';
    var _mine  = 'mine';
    var _flag  = 'flag';

    var init = function(options) {
      options = options || {};
      _sizeX = options.sizeX;
      _sizeY = options.sizeY;
      _mines = options.mines;
    };

    var createBoard = function() {
      //create empty board
      for (var i = 0; i < _sizeX; i++) {
        _board_array [i] = [];
        for (var j = 0; j < _sizeY; j++) {
          _board_array[i][j] = new Square(_empty);
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
        var x = Math.floor(Math.random() * _sizeX);
        var y = Math.floor(Math.random() * _sizeY);
        
        if(squareEmpty([x,y])) {
          _board_array[x][y] = new Square('mine');
        } else { //mine wasn't placed, place another
          i--;
        }

      }
    };

    var squareEmpty =  function(loc) {
      return (_board_array[loc[0]][loc[1]].piece_type === _empty );
    };

    var emptySquares = function(loc) {
      var empty = 0;
      for (var i = 0; i < _sizeX; i++) {
        for (var j = 0; j < _sizeY; j++) {
          if(squareEmpty([i,j])) {
            empty++;
          }
        }  
      }
      return empty;
    };

    var Square = function(piece_type) {
      this.piece_type = piece_type;
      this.revealed = false;
      this.flagged = false;

      var reveal = function() {
        this.revealed = true;
      };
    };

    var toggleFlag = function(loc) {
      console.log(loc);
      var square = _board_array[loc[0]][loc[1]];
      if(square.flagged === _empty) {
        square.flagged = true;
        return true;
      } else 
      {
        square.flagged = false;
        return false;
      }

    };

    return { //board
      init: init,
      createBoard: createBoard,
      toggleFlag: toggleFlag,
    }

  })();

  var boardView = ( function() {
    var $board;
    var init = function(){
      $board = $('#board');
    };

    var createBoard = function(sizeX, sizeY) {
      $board.empty();
      html_string = "";
      for (var i = 0; i < sizeX; i++) {
        html_string += '<div class="row">';

        for (var j = 0; j < sizeY; j++) {
          html_string += '<div class="board-square" id=' + 
                         game.rowColumnToId(i, j) + '></div>';
        };

        html_string += '</div>';
      }

      $board.append(html_string);
    };

    var toggleFlag = function(id) {
      $('#' + id).toggleClass('flagged');
    };

    return { //boardview
      init: init,
      createBoard: createBoard,
      toggleFlag: toggleFlag,
    }

  })();

  return { //minesweeper
    init: init,
  }

})();

$(minesweeper.init());
