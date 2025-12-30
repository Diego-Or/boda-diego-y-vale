import { Component, computed, signal} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


interface LocationData {
  mapUrl: string;
  googleMapsLink: string;
}

@Component({
  selector: 'app-location',
  templateUrl: 'location.html',
  styleUrl: 'location.scss'
})

export class locationComponent {
  // Señal con los datos de ubicación
  locationData = signal<LocationData>({
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1405.1345070352172!2d-73.98834135302378!3d5.051685542262284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e406f7d8259e95d%3A0x16de28e1d93d737c!2sRestaurante%20Campestre%20-%20La%20Hacienda!5e0!3m2!1ses-419!2sco!4v1767117505880!5m2!1ses-419!2sco',
    googleMapsLink: 'https://maps.app.goo.gl/wUEYqF9B1DhHYToQ8',
  });

  // Computed signal para la URL sanitizada del mapa
  safeMapUrl = computed<SafeResourceUrl>(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.locationData().mapUrl
    );
  });

  constructor(private sanitizer: DomSanitizer) {}

  // Método para actualizar la ubicación completa
  updateLocation(newData: Partial<LocationData>): void {
    this.locationData.update(current => ({
      ...current,
      ...newData
    }));
  }

  // Método para abrir Google Maps
  openGoogleMaps(): void {
    window.open(this.locationData().googleMapsLink, '_blank');
  }

  // TrackBy para la lista de direcciones
  trackByIndex(index: number): number {
    return index;
  }

}
