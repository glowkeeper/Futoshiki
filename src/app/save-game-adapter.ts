import { GameSaveState } from './models/game-save-state';
import { CellContentSnapshot } from './models/cell-content-snapshot';
import { BoardComponent } from './components/board/board.component';
import { PuzzleInfo } from './models/puzzle-info';
import { Coordinate } from './models/coordinate';

export class SaveGameAdapter {
  private static readonly _separator = '-';
  private static readonly emptyCellText = '0000';
  private static readonly _allCellValuesCached = [9, 8, 7, 6, 5, 4, 3, 2, 1];

  toText(info: PuzzleInfo, playTimeInSeconds: number, board: BoardComponent, forceEmptyBoard: boolean): string {
    let cells = '';
    let seenValues = false;

    if (!forceEmptyBoard) {
      for (const coordinate of Coordinate.iterateBoard(info.boardSize)) {
        const cell = board.getCell(coordinate);
        if (cell) {
          const snapshot = cell.getContentSnapshot();
          const text = this.formatCellSnapshot(snapshot);
          cells += text;

          if (text !== SaveGameAdapter.emptyCellText) {
            seenValues = true;
          }
        }
      }
    }

    let result = `D${info.difficulty}${SaveGameAdapter._separator}S${info.boardSize}${SaveGameAdapter._separator}I${info.id}`;

    const playTimeInWholeSeconds = Math.floor(playTimeInSeconds);
    if (playTimeInWholeSeconds > 0) {
      result += `${SaveGameAdapter._separator}T` + String('00000000' + playTimeInWholeSeconds).slice(-8);
    }

    if (seenValues) {
      result += `${SaveGameAdapter._separator}B` + cells;
    }

    return result;
  }

  private formatCellSnapshot(snapshot: CellContentSnapshot): string {
    if (snapshot.userValue !== undefined) {
      return 'ff' + this.decimalToHex(snapshot.userValue);
    } else if (snapshot.candidates.size > 0) {
      let candidateBitmask = 0;
      for (const candidate of snapshot.candidates) {
        candidateBitmask += Math.pow(2, candidate - 1);
      }

      const hexValue = this.decimalToHex(candidateBitmask);
      return hexValue.length === 2 ? '00' + hexValue : hexValue;
    } else {
      return SaveGameAdapter.emptyCellText;
    }
  }

  private decimalToHex(value: number) {
    const result = value.toString(16);
    return result.length % 2 === 1 ? '0' + result : result;
  }

  parseText(text: string): GameSaveState | undefined {
    let difficulty;
    let boardSize;
    let puzzleId;
    let playTimeInSeconds;
    let cellSnapshotMap: { [index: number]: CellContentSnapshot } | undefined;

    for (const setting of text.split(SaveGameAdapter._separator)) {
      if (setting.length >= 2) {
        switch (setting[0]) {
          case 'D':
            difficulty = this.parseIntegerInRange(setting.substring(1), 0, 3);
            break;
          case 'S':
            boardSize = this.parseIntegerInRange(setting.substring(1), 4, 9);
            break;
          case 'I':
            puzzleId = this.parseIntegerInRange(setting.substring(1), 1, 99999999);
            break;
          case 'T':
            playTimeInSeconds = this.parseIntegerInRange(setting.substring(1), 1, 99999999);
            break;
          case 'B':
            cellSnapshotMap = this.parseSnapshotMap(setting);
            break;
        }
      }
    }

    if (difficulty === undefined || boardSize === undefined || puzzleId === undefined) {
      return undefined;
    }

    return {
      info: {
        difficulty: difficulty,
        boardSize: boardSize,
        id: puzzleId
      },
      playTimeInSeconds: playTimeInSeconds || 0,
      cellSnapshotMap: cellSnapshotMap
    };
  }

  private parseIntegerInRange(text: string, minValue: number, maxValue: number): number | undefined {
    const value = parseInt(text, 10);
    if (!isNaN(value) && value >= minValue && value <= maxValue) {
      return value;
    }
    return undefined;
  }

  private parseSnapshotMap(setting: string): { [index: number]: CellContentSnapshot } | undefined {
    let cellSnapshotMap: { [index: number]: CellContentSnapshot } | undefined;
    let index = 0;
    let textOffset = 1;

    while (textOffset < setting.length) {
      const cellText = setting.substring(textOffset, textOffset + 4);
      const snapshot = this.parseCellSnapshot(cellText);

      if (cellSnapshotMap === undefined) {
        cellSnapshotMap = {};
      }
      cellSnapshotMap[index] = snapshot;

      index++;
      textOffset += 4;
    }

    return cellSnapshotMap;
  }

  private parseCellSnapshot(text: string): CellContentSnapshot {
    if (text.startsWith('ff')) {
      const userValue = parseInt(text.substring(2), 16);
      return CellContentSnapshot.fromUserValue(userValue);
    } else if (text === '0000') {
      return CellContentSnapshot.empty();
    } else {
      let candidateBitmask = parseInt(text, 16);
      const candidates = new Set<number>();

      for (const candidate of SaveGameAdapter._allCellValuesCached) {
        const bitmaskValue = Math.pow(2, candidate - 1);
        if (candidateBitmask - bitmaskValue >= 0) {
          candidateBitmask -= bitmaskValue;
          candidates.add(candidate);
        }
      }

      return CellContentSnapshot.fromCandidates(candidates);
    }
  }
}
