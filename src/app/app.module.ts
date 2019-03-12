import { AgmCoreModule } from '@agm/core';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

import { MatToolbarModule, MatInputModule, MatButtonModule, MatCardModule, MatSliderModule, MatProgressSpinnerModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MapComponent } from './map/map.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { MainComponent } from './main/main.component';
import { ResultsComponent } from './results/results.component';
import { KeysPipe } from './main/keys.pipe';
import { CamelPipe } from './main/camel.pipe';
import { NgxImageGalleryModule } from 'ngx-image-gallery';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavComponent,
    FooterComponent,
    MainComponent,
    ResultsComponent,
    KeysPipe,
    CamelPipe
  ],
  imports: [
    
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBUzUdZFOz9VqgNeiLa8wIPBJeDJTiZYMQ',
      libraries: ['places']
    }),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,      
    HttpClientModule,
    HttpClientJsonpModule,
    NgxImageGalleryModule
    //jsonpPipe
  ],
  exports: [
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
