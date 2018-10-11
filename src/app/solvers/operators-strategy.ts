import { SolverStrategy } from './solver-strategy';
import { Board } from '../models/board';
import { Coordinate } from '../models/coordinate';
import { ObjectFacilities } from '../object-facilities';
import { MoveDirection } from '../models/move-direction.enum';
import { ComparisonOperator } from '../models/comparison-operator.enum';

export class OperatorsStrategy extends SolverStrategy {
    constructor(board: Board) {
        super('Operator', board);
    }

    runAtBoard(): boolean {
        const allCellChanges = [];

        while (true) {
            const cellsChanged = this.singleRunAtBoard();
            if (cellsChanged.length > 0) {
                allCellChanges.push(cellsChanged);
            } else {
                break;
            }
        }

        if (allCellChanges.length > 0) {
            const count = this.flatten(allCellChanges);
            this.reportChange(`Operators around ${count} cells reduced candidates.`);
        }

        return allCellChanges.length > 0;
    }

    private singleRunAtBoard(): Coordinate[] {
        const cellsChanged: Coordinate[] = [];

        for (const coordinate of Coordinate.iterateBoard(this.board.size)) {
            const cell = this.board.getCell(coordinate);
            if (cell && cell.value === undefined) {
                if (this.reduceForOperators(coordinate)) {
                    cellsChanged.push(coordinate);
                }
            }
        }

        return cellsChanged;
    }

    private flatten(changes: Coordinate[][]): number {
        const flattened: string[] = [];

        for (const outer of changes) {
            for (const coordinate of outer) {
                const text = coordinate.toString();
                if (flattened.indexOf(text) <= -1) {
                    flattened.push(text);
                }
            }
        }

        return flattened.length;
    }

    runAtCoordinate(coordinate: Coordinate): boolean {
        const hasChanges = this.reduceForOperators(coordinate);

        if (hasChanges) {
            this.reportChange(`Operators around ${coordinate} reduced candidates.`);
        }

        return hasChanges;

    }

    private reduceForOperators(coordinate: Coordinate): boolean {
        let hasChanges = false;

        for (const directionPair of [[MoveDirection.Left, MoveDirection.Right], [MoveDirection.Up, MoveDirection.Down]]) {
            if (!this.reduceForOperatorPair(coordinate, directionPair[0], directionPair[1])) {
                for (const direction of directionPair) {
                    hasChanges = this.reduceForSingleOperator(coordinate, direction) || hasChanges;
                }
            } else {
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    private reduceForOperatorPair(coordinate: Coordinate, direction1: MoveDirection, direction2: MoveDirection): boolean {
        if (coordinate.canMoveOne(direction1) && coordinate.canMoveOne(direction2)) {
            const operator1 = this.board.getOperator(coordinate, direction1);
            const operator2 = this.board.getOperator(coordinate, direction2);

            if (operator1 !== ComparisonOperator.None && operator1 === operator2) {
                const adjacentCell1 = this.board.getCell(coordinate.moveOne(direction1));
                const adjacentCell2 = this.board.getCell(coordinate.moveOne(direction2));

                if (adjacentCell1 && adjacentCell2) {
                    if (operator1 === ComparisonOperator.LessThan) {
                        const adjacentMaxValue1 = adjacentCell1.getMaximum() || this.board.size;
                        const adjacentMaxValue2 = adjacentCell2.getMaximum() || this.board.size;

                        if (adjacentMaxValue1 === adjacentMaxValue2) {
                            const adjacentMaxValue = adjacentMaxValue1 - 1;
                            const generateCount = this.board.size - adjacentMaxValue + 1;
                            const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                            return this.removeCandidatesFromCell(coordinate, digitsToRemove,
                                `Operators ${MoveDirection[direction1]} > ${coordinate} < ${MoveDirection[direction2]}`);
                        }
                    } else {
                        const adjacentMinValue1 = adjacentCell1.getMinimum() || 1;
                        const adjacentMinValue2 = adjacentCell2.getMinimum() || 1;

                        if (adjacentMinValue1 === adjacentMinValue2) {
                            const adjacentMinValue = adjacentMinValue1 + 1;
                            const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                            return this.removeCandidatesFromCell(coordinate, digitsToRemove,
                                `Operators ${MoveDirection[direction1]} < ${coordinate} > ${MoveDirection[direction2]}`);
                        }
                    }
                }
            }
        }

        return false;
    }

    private reduceForSingleOperator(coordinate: Coordinate, direction: MoveDirection): boolean {
        if (coordinate.canMoveOne(direction)) {
            const operator = this.board.getOperator(coordinate, direction);
            if (operator !== ComparisonOperator.None) {
                const adjacentCell = this.board.getCell(coordinate.moveOne(direction));

                if (adjacentCell) {
                    if (operator === ComparisonOperator.LessThan) {
                        const adjacentMaxValue = adjacentCell.getMaximum() || this.board.size;
                        const generateCount = this.board.size - adjacentMaxValue + 1;
                        const digitsToRemove = ObjectFacilities.createNumberSequence(generateCount, adjacentMaxValue);
                        return this.removeCandidatesFromCell(coordinate, digitsToRemove,
                            `Operator ${coordinate} < ${MoveDirection[direction]}`);
                    } else {
                        const adjacentMinValue = adjacentCell.getMinimum() || 1;
                        const digitsToRemove = ObjectFacilities.createNumberSequence(adjacentMinValue);
                        return this.removeCandidatesFromCell(coordinate, digitsToRemove,
                            `Operator ${coordinate} > ${MoveDirection[direction]}`);
                    }
                }
            }
        }

        return false;
    }

    private removeCandidatesFromCell(coordinate: Coordinate, digitsToRemove: number[], description: string): boolean {
        const digitsRemoved = [];

        for (const digitToRemove of digitsToRemove) {
            if (this.removeCandidateFromCell(coordinate, digitToRemove)) {
                digitsRemoved.push(digitToRemove);
            }
        }

        if (digitsRemoved.length > 0) {
            console.log(`${description} eliminates ${digitsRemoved} from ${coordinate}.`);
        }

        return digitsRemoved.length > 0;
    }
}