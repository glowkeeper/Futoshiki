import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html'
})
export class DebugConsoleComponent {
  private _saveText = '';

  @Input()
  isVisible!: boolean;
  @Input()
  isEnabled!: boolean;
  @Output()
  loadClicked = new EventEmitter<string>();
  @Output()
  dumpBoardClicked = new EventEmitter();
  @Output()
  isTypingTextChanged = new EventEmitter<boolean>();

  updateSaveGameText(saveText: string) {
    this._saveText = saveText;
  }

  onLoadClicked() {
    this.loadClicked.emit(this._saveText);
  }

  onDumpBoardClicked() {
    this.dumpBoardClicked.emit();
  }

  onTextGotFocus() {
    this.isTypingTextChanged.emit(true);
  }

  onTextLostFocus() {
    this.isTypingTextChanged.emit(false);
  }
}
