import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classNames = props.highlight ? 'square highlight' : 'square';
  return (
    <button className={classNames} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const isHighlight = this.props.lines?.includes(i);
    return (
      <Square 
        value={this.props.squares[i]}
        highlight={isHighlight}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [...Array(3)].map((_, y) => {
      const cols = [...Array(3)].map((_, x) => {
        return this.renderSquare(y * 3 + x);
      });
      return (
        <div className="board-row">
          {cols}
        </div>
      );
    });
    
    return (
      <div>
        {rows}
      </div>
    );
  }
}

function MoveList(props) {
  const list = props.history.map((step, move) => {
    const desc = move ?
      `Go to move #${move} (${step.col + 1}, ${step.row + 1})` :
      'Go to game start';
    return (
      <li key={move}>
        <button 
          className={props.stepNumber === move ? 'current' : null} 
          onClick={() => props.onClick(move)}
        >
          {desc}
        </button>
      </li>
    );
  });
  return props.sortDesc ? list.reverse() : list;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null,
      }],
      stepNumber: 0,
      sortDesc: false,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: i % 3,
        row: Math.trunc(i / 3),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = 'Winner: ' + winner.player;
    } else if(!current.squares.includes(null)) {
      status = 'Winner: draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            lines={winner?.lines}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.setState({sortDesc: !this.state.sortDesc})}>↑↓</button>
          </div>
          <ol>
            <MoveList 
              history={history}
              stepNumber={this.state.stepNumber}
              sortDesc={this.state.sortDesc}
              onClick={(move) => this.jumpTo(move)}
            />
          </ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], lines: lines[i] };
    }
  }
  return null;
}