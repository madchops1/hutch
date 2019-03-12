import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  appTitle: string = 'HUTCH';
  appVersion: string = '1.0.1';


  constructor() { }

  ngOnInit() {
  }

}
