import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapService } from './map.service';
import { Observable } from 'rxjs';
import { Coordinate } from './coordinates.model';
import { Property } from './property.model';
import { BoundAttribute } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class MapComponent implements OnInit {

  lat: number = 51.678418;
  lng: number = 7.809007;
  zoom: number = 14;
  coordinateObservable: any = false;
  markersObservable: any = false;
  bounds: any = { north: 0, east: 0, south: 0, west: 0 };
  infoWindowOpened: any = null;
  //public featuredMark: any = this.mapService.f;
  //testString:
  
  private coords: Coordinate[];
  private markers: Property[] = [];
  //private markers: any[] = [];
  //markers: any = [];

  constructor(private mapService: MapService) { }

  ngOnInit() {

    console.log('markers length', '');
  
    this.mapService.setCoordinates(this.lat, this.lng);

    this.setCurrentPosition();
    
    // Subscribe to the coordinates from the observable
    this.coordinateObservable = this.mapService.getCoordinates();
    this.coordinateObservable.subscribe((coordinateData) => {
      this.coords = coordinateData;
    });

    // Subscribe to the markers observable
    this.markersObservable = this.mapService.getMarkers();
    this.markersObservable.subscribe((markerData) => {
      this.markers = markerData;
      //this.zoom = 4;
      
    });
  }

  clickedMarker(label: string, infoWindow, index: number) {
    console.log(`clicked the marker: ${label || index}`);
    if(this.infoWindowOpened === infoWindow) {
      return;
    }
    if(this.infoWindowOpened !== null) {
      this.infoWindowOpened.close();
    }
    this.infoWindowOpened = infoWindow;
    this.mapService.setFeature(this.mapService.markers[index]);
    //this.mapService.featuredMark.push(index);)

  }
  
  boundsChange(event) {
    //console.log('bounds changed', event);
    this.bounds.north = parseFloat(event.ma.l);
    this.bounds.south = parseFloat(event.ma.j);
    this.bounds.east = parseFloat(event.ga.l);
    this.bounds.west = parseFloat(event.ga.j);
    this.mapService.bounds = this.bounds;
  }

  goIdle(event) {
    console.log('idling', event);
  }

  private setCurrentPosition() {
    console.log('set current position and get user location');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('position', position);
        this.mapService.setCoordinates(position.coords.latitude, position.coords.longitude);
        /*
        let tmpData = {
          result: [
            { 
              address: [
                {
                  latitude: [position.coords.latitude], 
                  longitude: [position.coords.longitude]
                }
              ]
            }
          ]
        };
        this.mapService.setMarkers(tmpData);
        */
        this.zoom = 14;
      });
    }
  }
}
