import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { headerComponent } from './shared/Nav/header';
import { footerComponent } from './shared/footer/footer';
import { heroComponent } from './components/hero/hero';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, headerComponent, heroComponent, footerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('boda-angular');
}
