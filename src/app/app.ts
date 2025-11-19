import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { headerComponent } from './shared/Nav/header';
import { footerComponent } from './shared/footer/footer';
import { heroComponent } from './components/hero/hero';
import { historyComponent } from './components/history/history';
import { detailsComponent } from './components/details/details';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, headerComponent, heroComponent, historyComponent, detailsComponent, footerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('boda-angular');
}
