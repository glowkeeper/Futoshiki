import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { PuzzleDifficulty } from '../models/puzzle-difficulty.enum';
import { PuzzleInfo } from '../models/puzzle-info';
import { PuzzleData } from '../models/puzzle-data';
import { PuzzleTextParser } from '../puzzle-text-parser';
import { Logger } from '../logger';
import { LogCategory } from '../models/log-category.enum';

@Injectable()
export class PuzzleDataService {
  constructor(private _httpClient: HttpClient) {}

  getPuzzle(request: PuzzleInfo): Observable<PuzzleData> {
    const requestUrl = this.formatPuzzleUrl(request);
    Logger.write(LogCategory.Download, 'Loading puzzle from URL: ' + requestUrl);

    return this._httpClient.get(requestUrl, { responseType: 'text' }).pipe(
      map(responseText => {
        return PuzzleTextParser.parseText(responseText, request);
      })
    );
    // .pipe(delay(5000)) // Uncomment to simulate slow network
  }

  private formatPuzzleUrl(request: PuzzleInfo): string {
    const baseUrl = this.getBaseUrl(request.id);
    const fileName = 'Puzzle' + this.prefixNumber(request.id, '0000') + '.txt';
    return `${baseUrl}puzzles/${PuzzleDifficulty[request.difficulty]}/0${request.boardSize}x0${request.boardSize}/${fileName}`;
  }

  private getBaseUrl(puzzleId: number) {
    if (puzzleId % 2 === 1) {
      // Uncomment to simulate 404 server error
      // return 'https://raw.githubusercontent.com/bkoelman/Futoshiki/not-found/';
    }

    return 'https://raw.githubusercontent.com/bkoelman/Futoshiki/master/';
  }

  private prefixNumber(value: number, padding: string) {
    return (padding + value).slice(-padding.length);
  }
}
