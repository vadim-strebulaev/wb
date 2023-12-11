import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

    asUtc(date: Date): Date {
        if (date) {
            date = new Date(date.getTime());
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        }

        return date;
    }
}
