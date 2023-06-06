import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterAuthorizationStatuses",
})
export class FilterAuthorizationStatusesPipe implements PipeTransform {
  transform(statuses: any[], criteria: string[]): any[] {
    console.log(statuses);
    return statuses?.filter((status) => status?.status === "AUTHORIZED") || [];
  }
}
