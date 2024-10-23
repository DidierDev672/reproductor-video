import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoPlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'player-video';


  listVideo = [
    {
      title: 'One',
      src: '../assets/Clair Obscur： Expedition 33 - Cast Reveal Trailer ｜ PS5 Games.mp4'
    },
    {
      title: 'Two',
      src: '../assets/COFFEE ASMR - Satisfying Espresso Workflow.mp4'
    },
    {
      title: 'Three',
      src: '../assets/How To Make Pour Over Coffee - SIMPLE V60 Brew Tutorial.mp4'
    },
    {
      title: 'Four',
      src: "../assets/Marvel's Spider-Man 2 - Announce Trailer ｜ PC Games.mp4"
    },
    {
      title: 'Five',
      src: '../assets/Pour Over Brew Guide： Colombian Geisha From Wilder Lasso ( Orea v3 ).mp4'
    },
    {
      title: 'Six',
      src: '../assets/Unknown 9： Awakening - Cinematic Launch Trailer ｜ PS5 & PS4 Games.mp4'
    },
    {
      title: 'Seven',
      src: '../assets/Wuchang： Fallen Feathers 2024 Showcase Trailer ｜ PS5 Games.mp4'
    }
  ];


  selectedVideo: string = '';

  selectVideo(videoSrc: string) {
    this.selectedVideo = videoSrc;
  }
}
