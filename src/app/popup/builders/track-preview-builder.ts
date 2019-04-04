import { Observable, Subscription, timer } from 'rxjs';

export class TrackPreviewBuilder {

  /**
   * Percent of the way through the currently previewing clip
   */
  public progressPercent: number;
  /**
   * Property video preview button is bound to, determines if the user is previewing or not
   */
  public previewing: boolean;
  private progressTracker;
  private clipTimer: Observable<number>;
  private timerSubscription: Subscription;

  constructor() {
    this.previewing = false;
  }

  trackPreviewProgress(clipTimeMs: number, msIntoClip: number = null) {
    // Handles if somehow this method gets called while a preview is in progress
    if (this.previewing) {
      this.stopPreviewing();
    }
    this.setPreviewingState(true);
    // If the method was called during a preview, sync up progress percent with the msIntoClip passed in
    if (msIntoClip != null) {
      this.clipTimer = timer(0, 33);
      this.timerSubscription = this.clipTimer.subscribe(x => {
        this.progressPercent = ((x * 33 + msIntoClip) / clipTimeMs) * 100;
        this.refreshDOM();
      });
      // Set a timeout for the end of the partial preview
      setTimeout(() => {
        // Unsubscribe from the current timer and null it so it stops counting
        this.timerSubscription.unsubscribe();
        this.clipTimer = null;
        // Recursively call the function to set up an interval to repeat with the clip
        this.setPreviewInterval(clipTimeMs);
      }, clipTimeMs - msIntoClip);
    }
    else {
      this.setPreviewInterval(clipTimeMs);
    }
    return;
  }

  stopPreviewing() {
    clearInterval(this.progressTracker);
    this.timerSubscription.unsubscribe();
    this.clipTimer = null;
    this.setPreviewingState(false);
  }

  private setPreviewInterval(clipTimeMs: number) {
    // Start a timer that ticks every 33ms (30fps)
    this.clipTimer = timer(0, 33);
    // Every tick, the timer increments x by 1
    this.timerSubscription = this.clipTimer.subscribe(x => {
      // Multiplying x by the tick interval gives us elapsed ms, which allows us to calculate percentage
      this.progressPercent = (x * 33 / clipTimeMs) * 100;
      this.refreshDOM();
    });
    // This just repeats the above logic using the clip time as the interval
    this.progressTracker = setInterval(() => {
      this.timerSubscription.unsubscribe();
      this.clipTimer = timer(0, 33);
      this.timerSubscription = this.clipTimer.subscribe(x => {
        this.progressPercent = (x * 33 / clipTimeMs) * 100;
        this.refreshDOM();
      });
    }, clipTimeMs);
  }

  // TODO: This method doesn't really need to exist, need to figure out why DOM elements aren't updating on variable change
  private setPreviewingState(previewing: boolean) {
    this.previewing = previewing;
    this.refreshDOM();
  }

  private refreshDOM() {
    var el = document.getElementById("startMinutes");
    var evObj = document.createEvent("Events");
    evObj.initEvent("click", true, false);
    evObj.initEvent("blur", true, false);
    el.dispatchEvent(evObj);
    return;
  }
}
