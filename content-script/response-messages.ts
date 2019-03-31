import { Message } from './message';
import { ActionTypes } from './action-types';

export class GetVideoResponse implements Message {
    ActionType: ActionTypes;
    Duration: number;
    VideoId: string;
    StartSeconds: number;
    EndSeconds: number;
    ClipName: string;
    Previewing: boolean;

    constructor(duration: number, videoId: string, startSeconds: number = 0, endSeconds: number = 0, clipName: string = "", previewing: boolean = false) {
        this.ActionType = ActionTypes.GetVideo;
        this.Duration = duration;
        this.VideoId = videoId;
        this.StartSeconds = startSeconds;
        this.EndSeconds = endSeconds;
        this.ClipName = clipName;
        this.Previewing = previewing;
    }
}

export class GetCurrentTimeResponse implements Message {
    ActionType: ActionTypes;
    CurrentTime: number;
    Control: string;

    constructor(currentTime: number, control: string) {
        this.ActionType = ActionTypes.GetCurrentTime;
        this.CurrentTime = currentTime;
        this.Control = control;
    }
}

export class PreviewingResponse implements Message {
    ActionType: ActionTypes;
    Previewing: boolean;
    ClipTimeMs: number;

    constructor(previewing: boolean, cliptimeMs: number = null) {
        this.ActionType = ActionTypes.PreviewingChanged;
        this.Previewing = previewing;
        this.ClipTimeMs = cliptimeMs;
    }
}

export class PreviewingStateResponse implements Message {
  ActionType: ActionTypes;
  ClipTimeMs: number;
  MsIntoClip: number;

  constructor(clipTimeMs: number, msIntoClip: number) {
    this.ActionType = ActionTypes.PreviewingState;
    this.ClipTimeMs = clipTimeMs;
    this.MsIntoClip = msIntoClip;
  }
}
