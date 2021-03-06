import { Board } from './board';
import { Coordinate } from './coordinate';
import { MoveDirection } from './move-direction.enum';
import { ComparisonOperator } from './comparison-operator.enum';
import { Cell } from './cell';
import { MemoryCell } from './memory-cell';
import { SingleCoordinateStep } from './single-coordinate-step';
import { ObjectFacilities } from '../object-facilities';
import { assertBoardSizeIsValid } from '../assertions';

export class MemoryBoard implements Board {
  private readonly _cells: MemoryCell[] = [];
  private readonly _lessThanOperators: SingleCoordinateStep[] = [];

  readonly size: number;

  constructor(size: number) {
    assertBoardSizeIsValid(size);
    this.size = size;

    for (let index = 0; index < size * size; index++) {
      this._cells.push(new MemoryCell(this));
    }
  }

  getCell(coordinate: Coordinate): MemoryCell | undefined {
    const arrayIndex = coordinate.toIndex();
    return this._cells.find((item, index) => index === arrayIndex);
  }

  getCoordinate(cell: Cell): Coordinate | undefined {
    let arrayIndex = -1;

    this._cells.some((item, index) => {
      if (item === cell) {
        arrayIndex = index;
        return true;
      }
      return false;
    });

    return arrayIndex > -1 ? Coordinate.fromIndex(arrayIndex, this.size) : undefined;
  }

  getOperator(coordinate: Coordinate, direction: MoveDirection): ComparisonOperator {
    const step = new SingleCoordinateStep(coordinate, coordinate.moveOne(direction));

    if (this._lessThanOperators.some(item => item.isEqualTo(step))) {
      return ComparisonOperator.LessThan;
    } else {
      const reverseStep = step.reverse();

      if (this._lessThanOperators.some(item => item.isEqualTo(reverseStep))) {
        return ComparisonOperator.GreaterThan;
      }
    }

    return ComparisonOperator.None;
  }

  setOperator(coordinate: Coordinate, direction: MoveDirection, operatorValue: ComparisonOperator) {
    const step = new SingleCoordinateStep(coordinate, coordinate.moveOne(direction));
    ObjectFacilities.removeArrayElement(this._lessThanOperators, step, SingleCoordinateStep.areEqual);

    if (operatorValue !== ComparisonOperator.None) {
      this._lessThanOperators.push(operatorValue === ComparisonOperator.GreaterThan ? step.reverse() : step);
    }
  }
}
