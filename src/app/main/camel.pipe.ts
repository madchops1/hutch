import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camel'
})
export class CamelPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
  }

}
