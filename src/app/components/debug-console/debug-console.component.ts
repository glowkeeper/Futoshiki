import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html'
})
export class DebugConsoleComponent implements OnInit {
  @Input() isEnabled: boolean;
  @Output() loadClicked = new EventEmitter<string>();
  @Output() helpClicked = new EventEmitter();
  @Output() promoteClicked = new EventEmitter();
  @Output() isTypingTextChanged = new EventEmitter<boolean>();

  private _saveText: string;

  ngOnInit() {
  }

  updateSaveGameText(saveText: string): void {
    this._saveText = saveText;
  }

  onLoadClicked() {
    this.loadClicked.emit(this._saveText);
  }

  onHelpClicked() {
    this.helpClicked.emit();
  }

  onPromoteClicked() {
    this.promoteClicked.emit();
  }

  textGotFocus() {
    this.isTypingTextChanged.emit(true);
  }

  textLostFocus() {
    this.isTypingTextChanged.emit(false);
  }
}