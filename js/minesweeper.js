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

      board.addRevealListener(onReveal);

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

    var leftClick = function(eventData) {
      board.revealSquare(idToRowColumn(eventData.currentTarget.id));
    };

    var rightClick = function(eventData) {
      if(eventData.which != 3)
      {
        return;
      }
      var id = eventData.currentTarget.id;
      board.toggleFlag(idToRowColumn(id));
      boardView.toggleFlag(id);

    };

    var rowColumnToId = function(x, y) {
      return 'r' + x + 'c' + y;
    };

    var idToRowColumn = function(id) {
      return [Number(id.charAt(1)), Number(id.charAt(3))];
    };

    var onReveal = function(eventData) {
      console.log('onReveal: ' + eventData.square.piece_type)
      boardView.reveal(rowColumnToId(eventData.location[0], eventData.location[1]), 
                            eventData.square.piece_type, eventData.square.number);
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

    //piece types
    var _empty  = 'empty';
    var _mine   = 'mine';
    var _number = 'number';

    var _flag   = 'flag';

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
          _board_array[i][j] = new Square(_empty);
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
          _board_array[x][y] = new Square('mine');
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
      console.log('ad squares # ' + squares.length);
      return squares;
    };

    var addPlusOneMineToAdjacent = function(loc) {
      var squares = getSurroundingSquares(loc);
      console.log(squares);
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

    var Square = function(piece_type) {
      this.piece_type = piece_type;
      this.number = 0;
      this.revealed = false;
      this.flagged = false;
    };

    var revealSquare = function(loc) {
      this.revealed = true;
      onReveal(loc);
    };

    var onReveal = function(loc) {
      for(var id in _revealListeners) {
        _revealListeners[id]({
            location: loc,
            square: _board_array[loc[0]][loc[1]],
         });
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
      addRevealListener: addRevealListener,
      removeRevealListener: removeRevealListener,
      revealSquare: revealSquare,
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
      console.log(text);
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
