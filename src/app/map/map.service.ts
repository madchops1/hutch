import { Injectable } from '@angular/core';
import { Coordinate } from './coordinates.model';
import { Property } from './property.model';
import { Observable } from 'rxjs';
import { ZillowService } from '../main/zillow.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  coords: Coordinate[] = [];  // { lat: 0, lng: 0 };
  markers: Property[] = [];
  bounds: any = {};
  featuredMark: Property[] = [];

  constructor(private zillowService:ZillowService) { }

  public getFeature(): any {
    const feature = new Observable(observer => {
      setTimeout(() => {
        console.log('next');
        observer.next(this.featuredMark);
      }, 1000);
    });
    return feature;
  }

  public setFeature(marker): any {

    this.featuredMark.forEach(element => {
      this.featuredMark.shift();
    });
    this.featuredMark.shift();
    
    // get updated property details
    //this.zillowService.getUpdatedPropertyDetails(marker.zpid[0])
    const $getUpdatedPropertyDetails = this.zillowService.getUpdatedPropertyDetails(marker.zillow.zpid[0]);
    $getUpdatedPropertyDetails.subscribe(data => {
      //console.log('getSearchResults', data);
      //this.mapService.setMarkers(data);
      //if(data) {
      //  this.setRegionData(data);
      //}

      // Try and scrape here
      const $getMarketStatus = this.zillowService.getMarketStatus();
      $getMarketStatus.subscribe(dataBeta => {
        console.log('MARKET STATUS', dataBeta);
      });

      marker.updated = data;
      marker.images = this.setImages(data);  
      console.log('UPDATED DETAILS', marker);
      this.featuredMark.push(marker);
    });
  } 

  setImages(data) {
    let images = [];
    if(data && data.images && data.images.image[0].url.length) {
      data.images.image[0].url.forEach(element => {
        console.log('ELEMENT', element);
        images.push({
          url: element, 
          altText: '', 
          thumbnailUrl: element
        });
      });
    }
    return images;
  }

  public getCoordinates(): any {
    const coordinates = new Observable(observer => {
      setTimeout(() => {
        console.log('next');
        observer.next(this.coords);
      }, 1000);
    });
    return coordinates;
  }
  
  public setCoordinates(lat, lng): any {
    let coordObj = { lat: lat, lng: lng };
    this.coords.push(coordObj);
    //console.log('setCoordinates()', this.coords);
  }

  public getMarkers(): any {
    const marks = new Observable(observer => {
      setTimeout(() => {
        observer.next(this.markers);
      }, 1000);
    });
    return marks;
  }

  public setMarkers(markers): any {
    //let markObj = {}
    
    // remove the old markers
    //this.markers = [];
    /*
    this.markers.forEach(element => {
      this.markers.shift();
    });
    this.markers.shift();
    */
    markers.result.forEach(element => {
      let label = '';
      //let zEstimate = 0;
      //let zIndex = 0;

      if(element.zestimate && element.zestimate[0] && element.zestimate[0].amount[0] && element.zestimate[0].amount[0]._ && element.localRealEstate[0].region[0].zindexValue) {
        //console.log('zestimate', element.zestimate[0].amount[0]._);
        element.zestimate[0].amount[0]._ = parseFloat(element.zestimate[0].amount[0]._);
        element.localRealEstate[0].region[0].zindexValue[0] = parseFloat(element.localRealEstate[0].region[0].zindexValue[0].replace(/\,/g,''));
        //console.log('zestimate', zEstimate, zIndex);

        // handle the label
        //let zEstimate = element.zestimate[0].amount[0]._.replace(/\,/g,'');
        if(element.zestimate[0].amount[0]._ < element.localRealEstate[0].region[0].zindexValue[0]) {
          label = '!';        
        }

        

        

        this.markers.push({ 
          lat: element.address[0].latitude[0], 
          lng: element.address[0].longitude[0],
          label: label,
          icon: '/assets/map-icon-red.png',
          zillow: element
        });
      }
      
      
      
    });
    
    //this.markers = this.markers.concat(markers.result);
    //console.log('setMarkers()', markers.result, this.markers);
  }

  public filterPrice(max): any {

    this.markers.forEach(element => {

      let zillow: any = { 
        zestimate: [ 
          { amount: [
            {
              _: 0
            }
          ]
          }
        ]
      }
      
      zillow = element.zillow;
      //console.log('FILTER', zillow.zestimate[0].amount[0]._, max);
      if(zillow.zestimate[0].amount[0]._ < max) {
        element.visible = true;
      } else  {
        element.visible = false;
      }
    });
  }

}
