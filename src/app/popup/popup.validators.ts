import { ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Injectable } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material';

@Injectable({
    providedIn: 'root',
  })
export class TimeInputValidators {
    public startTimeValidator(): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
            var startTimeValue = control.get("startTime").value;
            var startMinutes = startTimeValue.minutes * 60;
            var startMs = startTimeValue.ms / 1000;
            var endTimeValue = control.get("endTime").value;
            var endMinutes = endTimeValue.minutes * 60;
            var endMs = endTimeValue.ms / 1000;
            // Define clip end time
            var clipEndTime = (endMinutes + endTimeValue.seconds + endMs);
            var clipStartTime = (startMinutes + startTimeValue.seconds + startMs);
            // return an error object if the current value of the control is greater than the difference of the clip end time and the other input values 
            if (clipStartTime - clipEndTime <= 0) {
                return null;
            }
            if (clipStartTime - clipEndTime >= 60) {
                return {'invalidStartMinutes': {value: startTimeValue.minutes}}
            }
            if (clipStartTime - clipEndTime >= 1) {
                return {'invalidStartSeconds': {value: startTimeValue.seconds}}
            }
            if (clipStartTime - clipEndTime > 0) {
                return {'invalidStartMs': {value: startTimeValue.ms}}
            }
        };
    }

    public endTimeValidator(videoEndTime: number) {
        return (control: AbstractControl): {[key: string]: any} | null => {
            var endTimeValue = control.get("endTime").value;
            var endMinutes = endTimeValue.minutes * 60;
            var endMs = endTimeValue.ms / 1000;
            var clipEndTime = (endMinutes + endTimeValue.seconds + endMs);
            // return an error object if the current value of the control is greater than the difference of the clip end time and the other input values 
            if (clipEndTime - videoEndTime <= 0) {
                return null;
            }
            if (clipEndTime - videoEndTime >= 60) {
                return {'invalidEndMinutes': {value: endTimeValue.minutes}}
            }
            if (clipEndTime - videoEndTime >= 1) {
                return {'invalidEndSeconds': {value: endTimeValue.seconds}}
            }
            if (clipEndTime - videoEndTime >= 0) {
                return {'invalidEndMs': {value: endTimeValue.ms}}
            }
        };
    }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidParentMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}