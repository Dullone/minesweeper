var minesweeper = (function() {
  init = function() {
    newGame();

    $('#reset').click(newGame);
  };

  var newGame = function()
  {
    game.init();
  };


  //piece types
  var _empty  = 'empty';
  var _mine   = 'mine';
  var _number = 'number';
  var _flag   = 'flag';
  var $flags;

  var game = ( function() {
    var _flags;
    var init = function() {
      var options = {
        sizeX: 9,
        sizeY: 9,
        mines: 10,
      }
      _flags = options.mines;
      board.init(options);
      boardView.init(options);

      boardView.createBoard(options.sizeX, options.sizeY);
      board.createBoard(options.sizeX, options.sizeY);

      board.addRevealListener(onReveal);

      $flags = $('#flags');
      updateFlags();
      $('#messages').empty();

      registerClicks();
    };

    var registerClicks = function() {
      $('#board .covered-square').click(leftClick.bind(this));
      $('#board .covered-square').mousedown(rightClick.bind(this));
      //disable context menu for board
      $('#board').on('contextmenu', function(eventData) {
          eventData.preventDefault();
        });
    };

    var unregisterClicks =  function() {
      $('#board .covered-square').unbind('click');
      $('#board .covered-square').unbind('mousedown');
    };

    var leftClick = function(eventData) {
      var squareType = board.revealCascade(idToRowColumn(eventData.currentTarget.id));
      if(squareType === _mine){
        gameOver();
      }
      if(board.unrevealedNonMines() === 0){
        gameWin();
      }
    };

    var rightClick = function(eventData) {
      if(eventData.which != 3)
      {
        return;
      }
      var id = eventData.currentTarget.id;
      //returns false if flag unaviable, otherwise new number of flags
      flagged = board.toggleFlag(idToRowColumn(id), _flags);
      if(flagged !== false){
        boardView.toggleFlag(id);
        _flags = flagged;
      }

      updateFlags();

    };

    var updateFlags = function() {
      $flags.text(_flags);
    };

    var rowColumnToId = function(x, y) {
      return 'r' + x + 'c' + y;
    };

    var idToRowColumn = function(id) {
      return [Number(id.charAt(1)), Number(id.charAt(3))];
    };

    var onReveal = function(square) {
      text = square.piece_type === _number ? square.number : '';
      boardView.reveal(rowColumnToId(square.location[0], square.location[1]), 
                                           square.piece_type, text);
    };

    var gameOver = function() {
      unregisterClicks();
      $('#messages').append('<div id="game-over">BOOOM!<br/>Game Over!</div>');
      board.revealAll();
    };

    var gameWin = function() {
      unregisterClicks();
      $('#messages').append('<div id="game-win">You won!</div>');
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

    var _revealListeners = [];

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
          _board_array[i][j] = new Square(_empty, [i,j]);
        }  
      }

      addMines(_mines);
    };

    var addMines = function(mines) {
      if (emptySquares() < mines) {
        return false;
      }
      for (var i = 1; i  <= _mines; i++) {
        var x = Math.floor(Math.random() * _sizeX);
        var y = Math.floor(Math.random() * _sizeY);
        
        if(squareEmpty([x,y])) {
          _board_array[x][y].piece_type = _mine;
          addPlusOneMineToAdjacent([x,y]);
        } else { //mine wasn't placed, place another
          i--;
        }

      }
    };

    var squareEmpty =  function(loc) {
      return (_board_array[loc[0]][loc[1]].piece_type === _empty || 
              _board_array[loc[0]][loc[1]].piece_type === _number);
    };

    var unrevealedNonMines = function() {
      unrevealed = _sizeY * _sizeX - _mines;
      for (var i = 0; i < _sizeX; i++) {
        for (var j = 0; j < _sizeY; j++) {
          if(_board_array[i][j].revealed && _board_array[i][j] !== _mine) {
            unrevealed--;
          }
        }  
      }
      return unrevealed;
    };

    var getSurroundingSquares = function(loc) {
      var squares = [];

      for (var i = loc[0] - 1; i <= loc[0] + 1; i++) {
        for (var j = loc[1] - 1; j <= loc[1] + 1; j++) {
          if(_board_array[i]) {//if undefined then outside of array so don't add
            if(_board_array[i][j] && !(i === loc[0] && j === loc[1]) ) {
              squares.push(_board_array[i][j]);
            }
          }
        }
      }
      return squares;
    };

    var addPlusOneMineToAdjacent = function(loc) {
      var squares = getSurroundingSquares(loc);
      for (var idx in squares) {
        if(squares[idx].piece_type === _number) {
          squares[idx].number++;
        } else if (squares[idx].piece_type !== _mine) {
          squares[idx].piece_type = _number;
          squares[idx].number++;
        }
      }
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

    var Square = function(piece_type, location) {
      this.piece_type = piece_type;
      this.location = location;
      this.number = 0;
      this.revealed = false;
      this.flagged = false;

      this.reveal = function() {
        this.revealed = true;
        onReveal(this);
      };
    };

    var revealSquare = function(loc) {
        _board_array[loc[0]][loc[1]].reveal();
    };

    var revealCascade = function(loc) {
      var square = _board_array[loc[0]][loc[1]];

      if(square.revealed || square.flagged){
        return;
      }

      //queue for traversal
      queue = [];
      queue.push(square);

      while(queue.length > 0) {
        square = queue.shift();
        square.reveal();

        if(square.piece_type === _empty) {
          adjacents = getSurroundingSquares(square.location);
          for(var idx in adjacents) {
            if(adjacents[idx].piece_type === _empty && !adjacents[idx].revealed) {
              queue.push(adjacents[idx])
            }
            adjacents[idx].reveal();
          }
        }
      }

      return square.piece_type;
    };

    var onReveal = function(square) {
      for(var id in _revealListeners) {
        _revealListeners[id](square);
      }
    };

    var addRevealListener = function(func) {
      _revealListeners.push(func);
    };

    var removeRevealListener = function(func) {
      var idx = _revealListeners.indexOf(func);
      if(func) {
        _revealListeners.splice(idx, 1);
      }
    };

    //returns false if flag unaviable, otherwise new number of flags
    var toggleFlag = function(loc, flags) {
      var square = _board_array[loc[0]][loc[1]];
      if(!square.flagged && flags > 0) {
        square.flagged = true;
        return --flags;
      } else if (square.flagged){
        square.flagged = false;
        return ++flags;
      }
      return false;
    };

    var revealAll = function() {
      for (var i = 0; i < _sizeX; i++) {
        for (var j = 0; j < _sizeY; j++) {
          _board_array[i][j].reveal();
        }  
      }
    };

    return { //board
      init: init,
      createBoard: createBoard,
      toggleFlag: toggleFlag,
      addRevealListener: addRevealListener,
      removeRevealListener: removeRevealListener,
      revealSquare: revealSquare,
      revealCascade: revealCascade,
      unrevealedNonMines: unrevealedNonMines,
      revealAll: revealAll,
    }

  })();

  var boardView = ( function() {
    var $board;
    var init = function(){
      $board = $('#board');
    };

    var createBoard = function(sizeX, sizeY) {
      $board.empty();
      var html_string = "";
      for (var i = 0; i < sizeX; i++) {
        html_string += '<div class="row">';

        for (var j = 0; j < sizeY; j++) {
          html_string += '<div class="covered-square" id=' + 
                         game.rowColumnToId(i, j) + '></div>';
        };

        html_string += '</div>';
      }

      $board.append(html_string);
    };

    var toggleFlag = function(id) {
      $('#' + id).toggleClass('flagged');
    };

    var reveal = function(id, _classType, text) {
      var $square = $('#' + id);
      $square.addClass(_classType);
      if(text){
        $square.text(text);
      }
      $square.removeClass('covered-square');
    };

    return { //boardview
      init: init,
      createBoard: createBoard,
      toggleFlag: toggleFlag,
      reveal: reveal,
    }

  })();

  return { //minesweeper
    init: init,
  }

})();

$(minesweeper.init());
