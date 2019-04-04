import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export class TimeInputBuilder {
    
    timeInput: FormGroup;
    nameInput: FormGroup;

    constructor(private fb: FormBuilder, startTime?: number | TimeObj, endTime?: number | TimeObj, clipName?: string) {
        var sm = 0, ss = 0, sms = 0, em = 0, es = 0, ems = 0, cn = "";
        if (typeof startTime === "number" && typeof endTime === "number") {
            sm = Math.floor(startTime / 60);
            ss = Math.floor(startTime % 60);
            sms = +(startTime % 1).toFixed(3) * 1000;
            em = Math.floor(endTime / 60);
            es = Math.floor(endTime % 60);
            ems = +(endTime % 1).toFixed(3) * 1000;
        }
        if (typeof startTime === "number" && typeof endTime === "object") {
            sm = Math.floor(startTime / 60);
            ss = Math.floor(startTime % 60);
            sms = +(startTime % 1).toFixed(3) * 1000;
            em = endTime.minutes;
            es = endTime.seconds;
            ems = endTime.ms;
        }
        if (typeof startTime === "object" && typeof endTime === "number") {
            sm = startTime.minutes;
            ss = startTime.seconds;
            sms = startTime.ms;
            em = Math.floor(endTime / 60);
            es = Math.floor(endTime % 60);
            ems = +(endTime % 1).toFixed(3) * 1000;
        }
        if (typeof startTime === "object" && typeof endTime === "object") {
            sm = startTime.minutes;
            ss = startTime.seconds;
            sms = startTime.ms;
            em = endTime.minutes;
            es = endTime.seconds;
            ems = endTime.ms;
        }
        if (clipName) {
            cn = clipName;
        }
        this.timeInput = this.fb.group({
            startTime: this.fb.group({
              minutes: [{value: sm, disabled: true}],
              seconds: [{value: ss, disabled: true}],
              ms: [{value: sms, disabled: true}, Validators.compose([Validators.required])]
            }),
            endTime: this.fb.group({
              minutes: [{value: em, disabled: true}],
              seconds: [{value: es, disabled: true}],
              ms: [{value: ems, disabled: true}, Validators.compose([Validators.required])]
            })
        });
        this.nameInput = this.fb.group({
            clipName: [{value: cn, disabled: true}, Validators.compose([Validators.required])]
          });
    }

    /**
     * Enables all controls within the time input
     */
    enable() {
        this.timeInput.enable();
        this.nameInput.enable();
        return;
    }

    /**
     * Determines if the total clip time is less than 500 milliseconds 
     * 
     * @returns boolean
     */
    isStartTimeValid() {
        var dif = this.getSeconds("endTime") - this.getSeconds("startTime");
        if (dif < 0.5) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Determines if the clip end time is greater than the video end time
     * 
     * @returns boolean
     * 
     * @param videoEndTime The end time of the video in seconds
     */
    isEndTimeValid(videoEndTime: number) {
        var dif = videoEndTime - this.getSeconds("endTime");
        if (dif < 0) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Gets the value of the specified control as a JSON object
     * 
     * @param control The desired control
     */
    getValue(control: string) {
        return this.timeInput.get(control).value;
    }

    /**
     * Gets the current value of the specified time input in seconds
     * 
     * @param control The control to get the value of
     */
    getSeconds(control: string): number {
        return (+this.timeInput.get(control).value.minutes * 60 + +this.timeInput.get(control).value.seconds + +this.timeInput.get(control).value.ms / 1000);
    }

    /**
     * Get the current clip name input value
     * 
     * @return clip name string
     */
    getClipName() {
        return this.nameInput.get("clipName").value;
    }

    /**
     * Sets the value of clip name input
     * 
     * @param clipName clip name string
     */
    setClipName(clipName: string) {
        this.nameInput.get("clipName").setValue(clipName);
        return;
    }

    /**
     * Sets the value of the specified time input from minutes, seconds, and milliseconds
     * 
     * Accepts:
     * @param startTime Either the total start seconds or an object containing the minutes, seconds, and milliseconds value
     * { minutes: number, seconds: number, ms: number }
     * @param endTime Either the total end seconds or an object containing the minutes, seconds, and milliseconds value
     * { minutes: number, seconds: number, ms: number }
     * 
     * OR
     * 
     * @param control The control to set the value of
     * @param time Either the total seconds or an object containing the minutes, seconds, and milliseconds value
     * { minutes: number, seconds: number, ms: number }
     * 
     * OR
     * 
     * @param control The control to set the value of
     * @param minutes What the minutes value will be set to
     * @param seconds What the seconds value will be set to
     * @param ms What the milliseconds value will be set to
     */
    setTime(startTime: number | TimeObj, endTime: number | TimeObj);
    setTime(control: string, time: number | TimeObj);
    setTime(control: string | number | TimeObj, minutesSecondsOrObj: number | TimeObj, seconds?: number, ms?: number) {
        if (typeof control === "string" && minutesSecondsOrObj && seconds && ms) {
            this.timeInput.get(control).setValue({minues: minutesSecondsOrObj, seconds: seconds, ms: ms});
            return;
        }
        if (typeof control === "string" && typeof minutesSecondsOrObj === "object") {
            this.timeInput.get(control).setValue(minutesSecondsOrObj);
            return;
        }
        if (typeof control === "string" && typeof minutesSecondsOrObj === "number") {
            var m = Math.floor(minutesSecondsOrObj / 60);
            var s = Math.floor(minutesSecondsOrObj % 60);
            var ms = +(minutesSecondsOrObj % 1).toFixed(3) * 1000;
            this.timeInput.get(control).setValue({minutes: m, seconds: s, ms: ms});
            return;
        }
        if (typeof control === "number" && typeof minutesSecondsOrObj === "number") {
            var sm = Math.floor(control / 60);
            var ss = Math.floor(control % 60);
            var sms = +(control % 1).toFixed(3) * 1000;
            var em = Math.floor(minutesSecondsOrObj / 60);
            var es = Math.floor(minutesSecondsOrObj % 60);
            var ems = +(minutesSecondsOrObj % 1).toFixed(3) * 1000;
            this.timeInput.setValue({startTime: {minutes: sm, seconds: ss, ms: sms}, endTime: {minutes: em, seconds: es, ms: ems}});
            return;
        }
        if (typeof control === "number" && typeof minutesSecondsOrObj === "object") {
            var sm = Math.floor(control / 60);
            var ss = Math.floor(control % 60);
            var sms = +(control % 1).toFixed(3) * 1000;
            this.timeInput.setValue({startTime: {minutes: sm, seconds: ss, ms: sms}, endTime: minutesSecondsOrObj});
            return;
        }
        if (typeof control === "object" && typeof minutesSecondsOrObj === "number") {
            var em = Math.floor(minutesSecondsOrObj / 60);
            var es = Math.floor(minutesSecondsOrObj % 60);
            var ems = +(minutesSecondsOrObj % 1).toFixed(3) * 1000;
            this.timeInput.setValue({startTime: control, endTime: {minutes: em, seconds: es, ms: ems}});
            return;
        }
        if (typeof control === "object" && typeof minutesSecondsOrObj === "object") {
            this.timeInput.setValue({startTime: control, endTime: minutesSecondsOrObj});
            return;
        }
    };
}

export interface TimeObj {
    minutes?: number;
    seconds?: number;
    ms?: number;
}
