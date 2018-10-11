import { Coordinate } from './models/coordinate';
import { Board } from './models/board';
import { MoveChecker } from './move-checker';
import { SolverStrategy } from './solvers/solver-strategy';
import { SetDraftValuesStrategy } from './solvers/set-draft-values-strategy';
import { NakedSingleStrategy } from './solvers/naked-single-strategy';
import { OperatorStrategy } from './solvers/operator-strategy';
import { HiddenSingleStrategy } from './solvers/hidden-single-strategy';
import { NakedSetStrategy } from './solvers/naked-set-strategy';
import { HiddenSetStrategy } from './solvers/hidden-set-strategy';

export class HintProvider {
    private _checker: MoveChecker;
    private _strategies: SolverStrategy[];

    constructor(private _board: Board) {
        this._checker = new MoveChecker(this._board);
        this._strategies = [
            new SetDraftValuesStrategy(this._board),
            new NakedSingleStrategy(this._board),
            new HiddenSingleStrategy(this._board),
            new OperatorStrategy(this._board),
            new NakedSetStrategy(this._board),
            new HiddenSetStrategy(this._board),
        ];
    }

    runAtBoard(): boolean {
        return this.runStrategies(strategy => strategy.runAtBoard());
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        return this.runStrategies(strategy => strategy.runAtCoordinate(coordinate));
    }

    private runStrategies(runStrategy: (strategy: SolverStrategy) => boolean) {
        if (this.isBoardValid()) {
            for (const strategy of this._strategies) {
                console.log('Running next strategy: ' + strategy.name);
                const hasChanges = runStrategy(strategy);

                if (hasChanges) {
                    if (!this.isBoardValid()) {
                        throw new Error('Strategy caused an invalid board.');
                    }

                    return true;
                }
            }
        }

        console.log('Hint is not available.');
        return false;
    }

    private isBoardValid() {
        for (const coordinate of Coordinate.iterateBoard(this._board.size)) {
            const cell = this._board.getCell(coordinate);
            if (cell) {
                if (cell.value !== undefined) {
                    const checkResult = this._checker.checkIsMoveAllowed(cell.value, coordinate);
                    if (!checkResult.isValid) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}