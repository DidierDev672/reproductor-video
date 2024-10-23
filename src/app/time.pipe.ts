import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appTime',
  standalone: true,
})
export class TimePipe implements PipeTransform {

  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

}
