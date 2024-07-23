import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Manifest } from '../models/manifest.model';

@Injectable({ providedIn: 'root' })
export class ManifestService {
  getManifest(httpClient: HttpClient): Observable<Manifest | null> {
    return httpClient.get<Manifest>('manifest.webapp').pipe(
      catchError(() => {
        console.warn(
          'Manifest file could not be loaded, default options have been used instead'
        );
        return of(null);
      })
    );
  }
}
