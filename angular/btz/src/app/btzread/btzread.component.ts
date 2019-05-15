import { Component, OnInit } from '@angular/core';
import { Steering } from '../steering';

@Component({
  selector: 'app-btzread',
  templateUrl: './btzread.component.html',
  styleUrls: ['./btzread.component.css']
})
export class BtzreadComponent implements OnInit {

  ster: Steering = {
    category: 'config',
    command: 'string',
    data: {jo: 'lol'},
    device: 'string'
};





  constructor() { }

  ngOnInit() {
  }
  
}

