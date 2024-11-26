import { Injectable } from "@angular/core";
import { NgxDhis2HttpClientModule, NgxDhis2HttpClientService } from "@iapps/ngx-dhis2-http-client";
import { map, Observable } from "rxjs";
import { Indicator } from "./models/indicator";

@Injectable({ providedIn: 'root' })
export class MetaDataService {
  constructor(
    private http: NgxDhis2HttpClientService
  ) {}

  fetchIndicators(): Observable<Indicator[]> {
    return this.http.get('indicators').pipe(
      map((response: any) => response.indicators)
    );
  }

  fetchIndicatorById(id: string) {
    return this.http.get(`indicators/${id}`); 
  }
}
