export class StoredVideoInfoModel { // TODO: Danny We might be able to move model validation here.
    public minutes: number;
    public seconds: number;
    public ms: number;

    public clipName: string;
    public videoId: string;
    public length: string; // todo: Danny This might need to be a number, depends how we use it. investigate
    public isPreviewing: boolean;
}