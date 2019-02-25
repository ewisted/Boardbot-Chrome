import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.css']
})
export class TimeInputComponent implements OnInit {
  @Output() formReady = new EventEmitter<FormGroup>();
  private videoTimeForm : FormGroup;
  
  constructor() { }

  ngOnInit() {
  }

}
