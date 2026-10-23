import { Injectable } from '@angular/core';
import { TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoStaticLoader implements TranslocoLoader {
  getTranslation = (_: string) => of({});
}
