import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapService } from '../map/map.service';
import { Coordinate } from '../map/coordinates.model';
import { Property } from '../map/property.model';
import { MapsAPILoader } from '@agm/core';
import { ZillowService } from './zillow.service';
import { googlemaps } from 'googlemaps';
import { NgxImageGalleryComponent, GALLERY_IMAGE, GALLERY_CONF } from "ngx-image-gallery";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MainComponent implements OnInit {

  @ViewChild('search') searchElement: ElementRef;
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;
  
  maxPrice: 1000000;              // the maxPrice variable for 
  mainForm: FormGroup;
  inProgress: any = false;        // inProgress currently not used
  inputCoordinates: any = {};     // the coordinates the user inputs
  formattedAddress: string = "";
  wholePlace: any = {};
  neighborhood: string;
  city: string;
  state: string;
  avgPrice: number;
  streets: any = [];
  secondPart: string = '';
  markersObservable: any = false;
  markers: Property[] = [];
  featuredObservable: any = false;
  feature: Property[] = [];
  formula: string = "M = P[i(1+i)^n]/[(1+i)^n -1]";
  objectKeys = Object.keys;

  mortgage: any = {
    homePrice: 1000000,
    downPayment: 0,
    newHomeAmt: 0,
    interestRate: 5,
    aprMonthlyRate: 0,
    numberOfPayments: 0,
    interestPayments: 0,
    mortgagePeriod: 15,
    monthlyPayment: 0
  }

  // gallery configuration
  conf: GALLERY_CONF = {
    imageOffset: '0px',
    showDeleteControl: false,
    showImageTitle: false,
  };

  constructor(
    private formBuilder: FormBuilder, 
    private mapsAPILoader: MapsAPILoader,
    private mapService: MapService,
    private ngZone: NgZone,
    private zillowService: ZillowService
  ) { }

  ngOnInit() {

    // Main form
    this.mainForm = this.formBuilder.group({
      search: ['', Validators.required]
    });


    // Subscribe to the markers observable
    this.markersObservable = this.mapService.getMarkers();
    this.markersObservable.subscribe((markerData) => {
      this.markers = markerData;
    });

    // Subscribe to the feature observable
    this.featuredObservable = this.mapService.getFeature();
    this.featuredObservable.subscribe((featureData) => {
      this.feature = featureData;

      // SET THE HOME PROCE IN THE FORM TODO...
      this.setMortgageCalculator(featureData);
      
      //console.log('FEATURE', this.feature);
    });

    // Setup the Google Maps API
    setTimeout(() => {
      this.mapsAPILoader.load().then(() => {
      
        //console.log('MAPS API LOADED');
        let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, {
          types: ["address"]
        });
  
        autocomplete.addListener("place_changed", () => {
          
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            //console.log('place', place);
            //console.log('place', place.geometry.location.lat(), place.geometry.location.lng());
            this.formattedAddress = place.formatted_address;
            this.inputCoordinates = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
            //this.mapService.setCoordinates(place.geometry.location.lat(), place.geometry.location.lng());
            this.wholePlace = place;
        });
      });
    }, 1000);
  }

  onSubmit() {

    if(this.mainForm.invalid) {
      return;
    }

    this.inProgress = true;

    this.mapService.setCoordinates(this.inputCoordinates.lat, this.inputCoordinates.lng);
    

    /*
    // set a new marker
    let tmpData = {
      result: [
        { 
          address: [
            {
              latitude: [this.inputCoordinates.lat], 
              longitude: [this.inputCoordinates.lng]
            }
          ]
        }
      ]
    };
    this.mapService.setMarkers(tmpData);
    */
    setTimeout(()=>{

      
      // Get the search results for the specific address
      let splitAddress = this.formattedAddress.split(",");
      this.secondPart = this.formattedAddress.substring(this.formattedAddress.indexOf(',')+1);
      //console.log('Split Address', splitAddress, secondPart);
      
      // Get the initial search results of the specific address
      const $getSearchResults = this.zillowService.getSearchResults(splitAddress[0], this.secondPart);
      $getSearchResults.subscribe(data => {
        //console.log('getSearchResults', data);
        this.mapService.setMarkers(data);
        if(data) {
          this.setRegionData(data);
        }
      });

      // Get all the nearest places...
      let coordinateString = this.buildCoordinateString();
      const $getNearestRoads = this.zillowService.getNearestRoads(coordinateString);
      $getNearestRoads.subscribe(data => {
        //console.log('getSeargetNearestRoadsResults', data);
        // get place details
        if(data) {
          this.getPlaceDetails(data);
        }
      });

      console.log('onSubmit()');

      return true;

    },500);
  }

  setMortgageCalculator(data) {


    if(data.zestimate && data.zestimate[0] && data.zestimate[0].amount[0] && data.zestimate[0].amount[0]._) {
      //if(data[0] && data[0].zillow && data[0].zillow.zestimate && data[0].zillow.zestimate[0].amount[0]) {
      console.log('SET MORTGAGE CALCULATOR', data);

      let price = data[0].zillow.zestimate[0].amount[0]._;
      this.mortgage.homePrice = price;
      this.findNewHomeAmt();
      this.monthlyPayment();
      //this.feature.zillow.zestimate.
    }
    
  }

  setRegionData(data): any {
    if(data.result) {

      // Set Avg Price
      if(!data.result[0].localRealEstate[0].region[0].zindexValue[0]) {
        this.avgPrice = 0;
      } else {
        this.avgPrice = data.result[0].localRealEstate[0].region[0].zindexValue[0];
      }
      // Set Neighborhood
      //console.log('SET NEIGHBORHOOD', data.result[0].localRealEstate[0].region[0].$.name);
      this.neighborhood = data.result[0].localRealEstate[0].region[0].$.name;

      // Set City
      this.city = data.result[0].address[0].city;

      // Set State
      this.state = data.result[0].address[0].state;
    }
  }

  getPlaceDetails(data): any {
    if(data) {

      // loop through all the placeIds from nearest roads and the the details.
      data.snappedPoints.forEach((element, i, array) => {
        let $getPlace = this.zillowService.getPlace(element.placeId);
        $getPlace.subscribe(data => {
          //console.log('getPlaceDetails', data);
          this.pushStreet(data);    
          //console.log('Streets', this.streets);
          //console.log('Looping streets', i);
        });
        //console.log('ALPHA', i, array.length-1)
        if(i == array.length - 1) {

          setTimeout(() => {
            if(i == array.length - 1) {
              this.inProgress = false;
            }
          }, 5000);
         //this.inProgress = false;
        }
      });
    }
  }
  
  // 10 rows of 10 points lat/lng
  buildCoordinateString(): any {

    let points = 10; // will create 100
    // let points = 5; // will create 25
    let lngDif = this.mapService.bounds.west  - this.mapService.bounds.east;
    let latDif = this.mapService.bounds.north - this.mapService.bounds.south;
    let latGap = latDif / points;
    let lngGap = lngDif / points;

    //console.log('latDif', latDif, latGap);
    //console.log('lngDif', lngDif, lngGap);
    let startLat = this.mapService.bounds.south; 
    let startLng = this.mapService.bounds.west;
    let j = 0; // columns
    let k = 0; // rows
    let pointsArray = [];
    for(let i = 0; i < (points*points); i++) {
      let point = (startLat + (latGap * k)) + ',' + (startLng - (lngGap * j));
      pointsArray.push(point);
      //console.log('Point', i, point);
      if(j == (points-1)) { j = 0; k++; } else { j++; }
    }

    return pointsArray.join("|");

  }

  pushStreet(data): any {
    
    // if it is a street
    if(data.address_components[1].types[0] == "route") {

      // check for dupes
      if(this.streets.indexOf(data.address_components[1].short_name + ", " + this.secondPart) == -1) {
        this.streets.push(data.address_components[1].short_name + ", " + this.secondPart);

        // get the search results for the street
        const $getSearchResults = this.zillowService.getSearchResults(data.address_components[1].short_name, this.secondPart);
        $getSearchResults.subscribe(data => {
          //console.log('getSearchResults', data);
          this.mapService.setMarkers(data);
          //console.log('getResults success', i, array.length);
          
        },
        (err) => { 
          //console.log(err);
          //console.log('getResults error', i, array.length); 

        });
      }
    }
  }

  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  onSliderChange(event) : any {
    console.log('slider', event);
    this.maxPrice = event.value;
    this.mapService.filterPrice(this.maxPrice);
  }

  homePriceChange(event) : any {
    this.mortgage.homePrice = event.value;
    this.findNewHomeAmt();
    this.monthlyPayment();
  }

  downPaymentChange(event) : any {
    this.mortgage.downPayment = event.value;
    this.findNewHomeAmt();
    this.monthlyPayment();
  }

  interestRateChange(event) : any {
    this.mortgage.interestRate = event.value;
    this.aprMonthly();
    this.interestPayments();
    this.monthlyPayment();
  }

  mortgagePeriodChange(event) : any {
    this.mortgage.mortgagePeriod = event.value;
    this.numOfPayments();
    this.interestPayments();
    this.monthlyPayment();
  }

  //subtract down payment from home price
  findNewHomeAmt() : any {
    this.mortgage.newHomeAmt = this.mortgage.homePrice - this.mortgage.downPayment;
  }
  
  //Calculate monthly APR Rate
  aprMonthly() : any {
    this.mortgage.aprMonthlyRate = ((this.mortgage.interestRate / 100) / 12);
  };
  
  //Calculate Total Number of Mortgage Payments
  numOfPayments() : any {
    this.mortgage.numberOfPayments = (this.mortgage.mortgagePeriod * 12);
  };
  
  //Calculate term (1+i)^n or interestPayments^numberOfPayments
  interestPayments() : any {
    this.mortgage.interestPayments = Math.pow(1 + this.mortgage.aprMonthlyRate, this.mortgage.numberOfPayments);
  };

  //calculate monthly mortgage payment
  monthlyPayment() : any {
    this.mortgage.monthlyPayment = (this.mortgage.newHomeAmt * (this.mortgage.aprMonthlyRate *      this.mortgage.interestPayments) / (this.mortgage.interestPayments - 1));
  };

  /* Gallery Methods & Events */
  openGallery(index: number = 0) {
    this.ngxImageGallery.open(index);
  }
    
  closeGallery() {
    this.ngxImageGallery.close();
  }
    
  newImage(index: number = 0) {
    this.ngxImageGallery.setActiveImage(index);
  }
    
  nextImage(index: number = 0) {
    this.ngxImageGallery.next();
  }
    
  prevImage(index: number = 0) {
    this.ngxImageGallery.prev();
  }

  galleryOpened(index) {
    console.info('Gallery opened at index ', index);
  }
 
  galleryClosed() {
    console.info('Gallery closed.');
  }
 
  galleryImageClicked(index) {
    console.info('Gallery image clicked with index ', index);
  }
  
  galleryImageChanged(index) {
    console.info('Gallery image changed to index ', index);
  }
 
  deleteImage(index) {
    console.info('Delete image at index ', index);
  }




}
