import { BoardTextConverter } from './board-text-converter';
import { Coordinate } from './models/coordinate';
import { MoveDirection } from './models/move-direction.enum';
import { ComparisonOperator } from './models/comparison-operator.enum';
import { MemoryBoard } from './models/memory-board';
import { expectEmptyCell, expectSingleUserValue, expectCandidates, expectOperator, expectFixedValue } from './test-expectations.spec';
import { Cell } from './models/cell';
import { Board } from './models/board';

describe('BoardTextConverter', () => {
  let converter: BoardTextConverter;

  beforeEach(() => {
    converter = new BoardTextConverter();
  });

  describe('textToBoard', () => {
    it('should parse board correctly', () => {
      const text = `
        +----+----+-----+-----+-------+
        | 25 |    |     |     | 12345 |
        +-v--+----+--^--+-----+-------+
        |    |    | 345 |     |       |
        +----+-v--+-----+-----+-------+
        |    |    | #2  |     >  134  |
        +-v--+----+-----+-----+-------+
        | !3 > !2 >  1  |     |  45   |
        +----+----+-----+-----+-------+
        | #4 |    >     | 123 <       |
        +----+----+-----+-----+-------+
        `;

      const board = converter.textToBoard(text);

      expect(board.size).toBe(5);

      expectCandidates('A1', [2, 5], board);
      expectEmptyCell('A2', board);
      expectEmptyCell('A3', board);
      expectEmptyCell('A4', board);
      expectCandidates('A5', [1, 2, 3, 4, 5], board);

      expectEmptyCell('B1', board);
      expectEmptyCell('B2', board);
      expectCandidates('B3', [3, 4, 5], board);
      expectEmptyCell('B4', board);
      expectEmptyCell('B5', board);

      expectEmptyCell('C1', board);
      expectEmptyCell('C2', board);
      expectFixedValue('C3', 2, board);
      expectEmptyCell('C4', board);
      expectCandidates('C5', [1, 3, 4], board);

      expectSingleUserValue('D1', 3, board);
      expectSingleUserValue('D2', 2, board);
      expectCandidates('D3', [1], board);
      expectEmptyCell('D4', board);
      expectCandidates('D5', [4, 5], board);

      expectFixedValue('E1', 4, board);
      expectEmptyCell('E2', board);
      expectEmptyCell('E3', board);
      expectCandidates('E4', [1, 2, 3], board);
      expectEmptyCell('E5', board);

      expectOperator('A1', MoveDirection.Right, ComparisonOperator.None, board);
      expectOperator('A1', MoveDirection.Down, ComparisonOperator.GreaterThan, board);
      expectOperator('A3', MoveDirection.Down, ComparisonOperator.LessThan, board);

      expectOperator('C2', MoveDirection.Up, ComparisonOperator.LessThan, board);
      expectOperator('C4', MoveDirection.Right, ComparisonOperator.GreaterThan, board);

      expectOperator('D1', MoveDirection.Up, ComparisonOperator.LessThan, board);
      expectOperator('D1', MoveDirection.Right, ComparisonOperator.GreaterThan, board);
      expectOperator('D3', MoveDirection.Left, ComparisonOperator.LessThan, board);

      expectOperator('E3', MoveDirection.Left, ComparisonOperator.LessThan, board);
      expectOperator('E4', MoveDirection.Right, ComparisonOperator.LessThan, board);
    });
  });

  describe('boardToText', () => {
    it('should format board correctly', () => {
      const board = new MemoryBoard(5);

      getExistingCell(board, 'A1').setCandidates(new Set([2, 5]));
      getExistingCell(board, 'A5').setCandidates(new Set([1, 2, 3, 4, 5]));

      getExistingCell(board, 'B3').setCandidates(new Set([3, 4, 5]));

      getExistingCell(board, 'C3').setFixedValue(2);
      getExistingCell(board, 'C5').setCandidates(new Set([1, 3, 4]));

      getExistingCell(board, 'D1').setUserValue(3);
      getExistingCell(board, 'D2').setUserValue(2);
      getExistingCell(board, 'D3').setCandidates(new Set([1]));
      getExistingCell(board, 'D5').setCandidates(new Set([4, 5]));

      getExistingCell(board, 'E1').setFixedValue(4);
      getExistingCell(board, 'E4').setCandidates(new Set([1, 2, 3]));

      board.setOperator(Coordinate.fromText('A1', board.size), MoveDirection.Down, ComparisonOperator.GreaterThan);
      board.setOperator(Coordinate.fromText('A3', board.size), MoveDirection.Down, ComparisonOperator.LessThan);

      board.setOperator(Coordinate.fromText('C2', board.size), MoveDirection.Up, ComparisonOperator.LessThan);
      board.setOperator(Coordinate.fromText('C4', board.size), MoveDirection.Right, ComparisonOperator.GreaterThan);

      board.setOperator(Coordinate.fromText('D1', board.size), MoveDirection.Up, ComparisonOperator.LessThan);
      board.setOperator(Coordinate.fromText('D1', board.size), MoveDirection.Right, ComparisonOperator.GreaterThan);
      board.setOperator(Coordinate.fromText('D3', board.size), MoveDirection.Left, ComparisonOperator.LessThan);

      board.setOperator(Coordinate.fromText('E3', board.size), MoveDirection.Left, ComparisonOperator.LessThan);
      board.setOperator(Coordinate.fromText('E4', board.size), MoveDirection.Right, ComparisonOperator.LessThan);

      const formatted = converter.boardToText(board, ' '.repeat(8));

      expect('\n' + formatted).toBe(`
        +----+----+-----+-----+-------+
        | 25 |    |     |     | 12345 |
        +-v--+----+--^--+-----+-------+
        |    |    | 345 |     |       |
        +----+-v--+-----+-----+-------+
        |    |    | #2  |     >  134  |
        +-v--+----+-----+-----+-------+
        | !3 > !2 >  1  |     |  45   |
        +----+----+-----+-----+-------+
        | #4 |    >     | 123 <       |
        +----+----+-----+-----+-------+`);
    });
  });

  function getExistingCell(board: Board, coordinateText: string): Cell {
    const cell = board.getCell(Coordinate.fromText(coordinateText, board.size));
    if (!cell) {
      throw new Error(`Cell '${coordinateText}' not found on ${board.size}x${board.size} board.`);
    }

    return cell;
  }
});
