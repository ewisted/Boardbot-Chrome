export class CommandStringBuilder {

  BotName: string;
  ClipName: string;
  VideoId: string;
  StartTimeSeconds: number;
  EndTimeSeconds: number;

  constructor(clipName: string, videoId: string, startTimeSeconds: number, endTimeSeconds: number, botName: string = "Boardbot") {
    // Replace any spaces in the clip name with dashes, and make it lower case
    // This provides consistancy with how clips are named and makes sure the clip name is valid at the same time
    this.ClipName = clipName.trim().replace(/\s+/g, '-').toLowerCase();
    this.VideoId = videoId;
    this.StartTimeSeconds = startTimeSeconds;
    this.EndTimeSeconds = endTimeSeconds;
    this.BotName = botName;
  }

  build(): string {
    var s_m = this.prependZero(Math.floor(this.StartTimeSeconds / 60), false);
    var s_s = this.prependZero(Math.floor(this.StartTimeSeconds % 60), false);
    var s_ms = this.prependZero(+(this.StartTimeSeconds % 1).toFixed(3) * 1000, true);
    var e_m = this.prependZero(Math.floor(this.EndTimeSeconds / 60), false);
    var e_s = this.prependZero(Math.floor(this.EndTimeSeconds % 60), false);
    var e_ms = this.prependZero(+(this.EndTimeSeconds % 1).toFixed(3) * 1000, true);

    var startTimeString = s_m + ":" + s_s + "." + s_ms;
    var endTimeString = e_m + ":" + e_s + "." + e_ms;

    return "@" + this.BotName + " add-clip " + this.ClipName + " " + this.VideoId + " " + startTimeString + " " + endTimeString;
  }

  private prependZero(n, isMs: boolean): string {
    var str = ("" + n);
    if (n < 100 && isMs) {
      str = "0" + str;
    }
    if (n < 10) {
      str = "0" + str;
    }
    return str;
  }
}
