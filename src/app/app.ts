import { faqComponent } from './components/faq/faq';
import { galleryComponent } from './components/gallery/gallery';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { headerComponent } from './shared/Nav/header';
import { footerComponent } from './shared/footer/footer';
import { heroComponent } from './components/hero/hero';
import { historyComponent } from './components/history/history';
import { detailsComponent } from './components/details/details';
import { locationComponent } from "./components/location/location";
import { rsvpComponent } from './components/assistance/rsvp';
import { contactComponent } from './components/contact/contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, headerComponent, heroComponent, historyComponent, detailsComponent, locationComponent, rsvpComponent, galleryComponent, faqComponent, contactComponent, footerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('boda-angular');
}
