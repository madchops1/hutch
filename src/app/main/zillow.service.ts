import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';

import { HttpHeaders } from '@angular/common/http';
import { Parser } from 'xml2js';

@Injectable({
  providedIn: 'root'
})
export class ZillowService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'text/xml',
    })
  };

  baseUrl: string = 'https://us-central1-hutch-api.cloudfunctions.net/';

  //quote: Observable<string>;
  googleKey: string = 'AIzaSyBUzUdZFOz9VqgNeiLa8wIPBJeDJTiZYMQ';

  constructor(private http: HttpClient) { }

  public getSearchResults(address, citystatezip) {
    //let url = 'https://www.zillow.com/webservice/GetSearchResults.htm';
    //let url = 'http://www.zillow.com/webservice/GetRegionChildren.htm?zws-id=X1-ZWz182vdo3h4p7_ahuyo&state=wa&city=seattle&childtype=neighborhood';
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getSearchResults?address='+address+'&citystatezip='+citystatezip;
    return this.http.get(url);       
  }

  public getRegionChildren(city, state) {
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getRegionChildren?city='+city+'&state='+state;
    return this.http.get(url);
  }

  public getRawZillowSearchResults(west, south, east, north) {
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getRawZillowSearchResults?west=' + west +'&south=' + south +'&east=' + east +'&north=' + north + '';
    return this.http.get(url);
  }

  public getNearestRoads(coordinateString) {
    let url = 'https://roads.googleapis.com/v1/nearestRoads?points=' + coordinateString + '&key=' + this.googleKey + '';
    return this.http.get(url);
  }

  public getPlace(placeId) {
    //let url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&fields=name,address_component&key=' + this.googleKey + '';
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getPlaceDetails?placeid=' + placeId + '';
    return this.http.get(url);
  }

  public getUpdatedPropertyDetails(zpid) {
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getUpdatedPropertyDetails?zpid=' + zpid + '';
    return this.http.get(url);
  }

  public getMarketStatus() {
    let url = 'https://us-central1-hutch-api.cloudfunctions.net/getMarketStatus';
    return this.http.get(url);
  }

}
