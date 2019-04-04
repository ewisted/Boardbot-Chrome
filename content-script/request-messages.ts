import { Message } from './message';
import { ActionTypes } from './action-types';

export class SyncRequest implements Message {
    ActionType: ActionTypes;

    constructor() {
        this.ActionType = ActionTypes.Sync;
    }
}

export class StartPreviewingRequest implements Message {
    ActionType: ActionTypes;
    ClipTimeMs: number;
    StartSeconds: number;
    EndSeconds: number;

    constructor(clipTimeMs: number, startSeconds: number, endSeconds: number) {
        this.ActionType = ActionTypes.StartPreviewing;
        this.ClipTimeMs = clipTimeMs;
        this.StartSeconds = startSeconds;
        this.EndSeconds = endSeconds;
    }
}

export class StopPreviewingRequest implements Message {
    ActionType: ActionTypes;

    constructor() {
        this.ActionType = ActionTypes.StopPreviewing;
    }
}

export class GetCurrentTimeRequest implements Message {
    ActionType: ActionTypes;
    Control: string;

    constructor(control: string) {
        this.ActionType = ActionTypes.GetCurrentTime;
        this.Control = control;
    }
}

export class SaveRequest implements Message {
    ActionType: ActionTypes;
    StartSeconds: number;
    EndSeconds: number;
    ClipName: string;

    constructor(startSeconds: number, endSeconds: number, clipName: string) {
        this.ActionType = ActionTypes.Save;
        this.StartSeconds = startSeconds;
        this.EndSeconds = endSeconds;
        this.ClipName = clipName;
    }
}
