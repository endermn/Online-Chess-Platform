import React from 'react';
import styles from './chessboard.module.css'

const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? 'white' : 'black';
};

const getDynamicClass = (name) => {
    return styles.name
}
const Chessboard = (fen) => {
  const boardSize = 8;


  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 ">
          <div className={styles.chessboard}>
            {Array.from({ length: boardSize }, (_, row) => (
              <div key={row} className={styles.chessboardRow}>
                {Array.from({ length: boardSize }, (_, col) => {
                  const squareColor = getSquareColor(row, col);
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`${styles.square} ${styles[squareColor]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
