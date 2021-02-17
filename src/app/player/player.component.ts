import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import * as YTPlayer from 'yt-player';

interface PlayerOptions {
  width: number;
  height: number;
  autoplay: boolean;
  captions: string | boolean;
  controls: boolean;
  keyboard: boolean;
  fullscreen: boolean;
  annotations: boolean;
  modestBranding: boolean;
  related: boolean;
  timeupdateFrequency: number;
  playsInline: boolean;
  start: number;
  host: string;
}

enum SuggestedQuality {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Hd720 = 'hd720',
  Hd1080 = 'hd1080',
  Highres = 'highres',
  Default = 'default',
}

enum PlaybackRate {
  x025 = 0.25,
  x05 = 0.5,
  x1 = 1,
  x15 = 1.5,
  x20 = 2,
}

enum State {
  Unstarted = 'unstarted',
  Ended = 'ended',
  Playing = 'playing',
  Paused = 'paused',
  Buffering = 'buffering',
  Cued = 'cued',
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnChanges, AfterViewInit {
  @Input() id: string;
  @Input() set options(value: PlayerOptions) {
    this._options = Object.assign({}, this.defaultOptions, value);
  }
  get options(): PlayerOptions {
    return this._options;
  }

  @ViewChild('player') playerRef: ElementRef;
  @ViewChild('playerWrapper') playerWrapperRef: ElementRef;

  @Output() playerError = new EventEmitter<any>();
  @Output() playerUnplayable = new EventEmitter<string>();
  @Output() playerTimeupdate = new EventEmitter<number>();
  @Output() playerUnstarted = new EventEmitter<any>();
  @Output() playerEnded = new EventEmitter<any>();
  @Output() playerPlaying = new EventEmitter<any>();
  @Output() playerPaused = new EventEmitter<any>();
  @Output() playerBuffering = new EventEmitter<any>();
  @Output() playerCued = new EventEmitter<any>();
  @Output() playerPlaybackQualityChange = new EventEmitter<SuggestedQuality>();
  @Output() playerPlaybackRateChange = new EventEmitter<PlaybackRate>();

  public get destroyed(): boolean {
    return this.player.destroyed;
  }

  public get videoId(): string {
    return this.player.videoId;
  }

  private player;
  private _options: PlayerOptions;
  private defaultOptions: Partial<PlayerOptions> = {
    controls: false,
    autoplay: false,
  };
  private initialized = false;

  public currentTime = 0;
  public currentTimeFormatted = '0:00';
  public states = State;
  public state: State = State.Unstarted;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(): void {
    if (this.initialized) {
      this.load();
    }
  }

  ngAfterViewInit(): void {
    this.init();
  }

  private init(): void {
    if (this.initialized) {
      return;
    }

    this.player = new YTPlayer(this.playerRef.nativeElement, this.options);
    this.load();
    this.setEvents();
    this.initialized = true;
  }

  private load(): void {
    this.player.load(this.id, this.options.autoplay, this.options.start);
  }

  private setEvents(): void {
    this.player.on('error', (err) => this.playerError.emit(err));
    this.player.on('unplayable', (videoId: string) =>
      this.playerUnplayable.emit(videoId)
    );
    this.player.on('timeupdate', (seconds: number) => {
      this.currentTime = Math.round(seconds);
      this.currentTimeFormatted = this.getCurrentTimeFormated(seconds);
      this.changeDetectorRef.detectChanges();
      this.playerTimeupdate.emit(seconds);
    });
    this.player.on('unstarted', () => {
      this.playerUnstarted.emit();
    });
    this.player.on('ended', () => this.playerEnded.emit());
    this.player.on('playing', () => {
      this.state = State.Playing;
      this.changeDetectorRef.detectChanges();
      this.playerPlaying.emit();
    });
    this.player.on('paused', () => {
      this.state = State.Paused;
      this.changeDetectorRef.detectChanges();
      this.playerPaused.emit();
    });
    this.player.on('buffering', () => this.playerCued.emit());
    this.player.on('cued', () => this.playerCued.emit());
    this.player.on('playbackQualityChange', (quality: SuggestedQuality) =>
      this.playerPlaybackQualityChange.emit(quality)
    );
    this.player.on('playbackRateChange', (playbackRate: PlaybackRate) =>
      this.playerPlaybackRateChange.emit(playbackRate)
    );
  }

  private getCurrentTimeFormated(seconds: number): string {
    const secondsRounded = Math.round(seconds);
    return new Date(secondsRounded * 1000).toISOString().substr(14, 5);
  }

  // Public API
  public play(): void {
    return this.player.play();
  }

  public pause(): void {
    return this.player.pause();
  }

  public stop(): void {
    return this.player.stop();
  }

  public seek(seconds: number): void {
    return this.player.seek(seconds);
  }

  public setVolume(volume: number): void {
    this.player.setVolume(volume);
  }

  public getVolume(): number {
    return this.player.getVolume();
  }

  public mute(): void {
    return this.player.mute();
  }

  public unMute(): void {
    return this.player.unMute();
  }

  public isMuted(): boolean {
    return this.player.isMuted();
  }

  public setSize(width: number, height: number): void {
    return this.player.setSize(width, height);
  }

  public setPlaybackRate(rate: PlaybackRate): void {
    return this.player.setPlaybackRate(rate);
  }

  public setPlaybackQuality(suggestedQuality: SuggestedQuality): void {
    return this.player.setPlaybackQuality(suggestedQuality);
  }

  public getPlaybackRate(): PlaybackRate {
    return this.player.getPlaybackRate();
  }

  public getAvailablePlaybackRates(): number[] {
    return this.player.getAvailablePlaybackRates();
  }

  public getDuration(): number {
    return this.player?.getDuration();
  }

  public getProgress(): number {
    return this.player.getProgress();
  }

  public getState(): State {
    return this.player.getState();
  }

  public getCurrentTime(): number {
    return this.player.getCurrentTime();
  }

  public destroy(): void {
    return this.player.destroy();
  }
}
