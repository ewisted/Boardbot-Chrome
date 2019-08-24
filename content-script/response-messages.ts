import { Message } from './message';
import { ActionTypes } from './action-types';

export class Pong implements Message {
    ActionType: ActionTypes;

    constructor() {
        this.ActionType = ActionTypes.Pong;
    }
}

export class SyncResponse implements Message {
    ActionType: ActionTypes;
    Duration: number;
    VideoId: string;
    StartSeconds: number;
    EndSeconds: number;
    ClipName: string;

    constructor(duration: number, videoId: string, startSeconds: number, endSeconds: number, clipName: string) {
        this.ActionType = ActionTypes.Sync;
        this.Duration = duration;
        this.VideoId = videoId;
        this.StartSeconds = startSeconds;
        this.EndSeconds = endSeconds;
        this.ClipName = clipName;
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
    MsIntoClip: number;

    constructor(previewing: boolean, cliptimeMs: number = 0, msIntoClip: number = 0) {
        this.ActionType = ActionTypes.PreviewingChanged;
        this.Previewing = previewing;
        this.ClipTimeMs = cliptimeMs;
        this.MsIntoClip = msIntoClip;
    }
}
