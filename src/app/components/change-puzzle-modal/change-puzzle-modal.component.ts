import { Component, Output, EventEmitter, AfterViewChecked, NgZone } from '@angular/core';
import { PuzzleInfo } from '../../models/puzzle-info';
import { PuzzleDifficulty } from '../../models/puzzle-difficulty.enum';
import { ObjectFacilities } from '../../object-facilities';

declare var $: any;

@Component({
  selector: 'app-change-puzzle-modal',
  templateUrl: './change-puzzle-modal.component.html'
})
export class ChangePuzzleModalComponent implements AfterViewChecked {
  private _bootstrapHooksRegistered = false;
  private _lastChangeEventData: string | undefined;

  @Output()
  puzzleChanged = new EventEmitter<PuzzleInfo>();

  readonly maxPuzzleId = 9999;
  PuzzleDifficultyAlias = PuzzleDifficulty;
  info: PuzzleInfo | undefined;
  isModalVisible = false;
  isLoaderVisible = false;

  constructor(private _zone: NgZone) {}

  ngAfterViewChecked() {
    this.registerBootstrapHooks();
  }

  private registerBootstrapHooks() {
    if (!this._bootstrapHooksRegistered) {
      const target = $('#changePuzzleModal');
      if (target.length > 0) {
        target.on('show.bs.modal', () => {
          this._zone.run(() => {
            this.isModalVisible = true;
          });
        });
        target.on('hide.bs.modal', () => {
          this._zone.run(() => {
            this.isModalVisible = false;
          });
        });
        this._bootstrapHooksRegistered = true;
      }
    }
  }

  setDefaults(info: PuzzleInfo) {
    this.info = {
      difficulty: info.difficulty,
      boardSize: info.boardSize,
      id: info.id
    };
    this._lastChangeEventData = undefined;
  }

  selectRandomGame(info: PuzzleInfo) {
    this.setDefaults(info);
    this.onRandomButtonClicked();
  }

  onPreviousButtonClicked() {
    if (this.info) {
      this.info.id--;
      this.onPuzzleChanged();
    }
  }

  onNextButtonClicked() {
    if (this.info) {
      this.info.id++;
      this.onPuzzleChanged();
    }
  }

  onRandomButtonClicked() {
    if (this.info) {
      this.info.id = ObjectFacilities.getRandomIntegerInRange(1, this.maxPuzzleId);
      this.onPuzzleChanged();
    }
  }

  onApplyButtonClicked() {
    this.onPuzzleChanged();
  }

  onPuzzleChanged() {
    if (this.info && !this.isDuplicateEvent()) {
      this.puzzleChanged.emit({
        difficulty: this.info.difficulty,
        boardSize: this.info.boardSize,
        id: this.info.id
      });
    }
  }

  private isDuplicateEvent(): boolean {
    const eventData = JSON.stringify(this.info);

    if (this._lastChangeEventData !== eventData) {
      this._lastChangeEventData = eventData;
      return false;
    }

    return true;
  }
}
