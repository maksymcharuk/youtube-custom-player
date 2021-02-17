import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'youtube-custom-player';
  videoId = 'GKSRyLdjsPA';
  options = {
    start: 0,
  };

  onPlayerTimeupdate($event): void {
    console.log(`Time: ${$event}`);
  }

  changeVideo(): void {
    this.videoId = 'gw2nclcoFNE';
  }

  changeOptions(): void {
    this.options = {
      start: 30,
    };
  }
}
