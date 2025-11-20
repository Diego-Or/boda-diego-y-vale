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
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1987.262400728208!2d-74.00498842487563!3d5.018265162316214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4071b91a4a14d9%3A0x859d753e42baeaee!2sSalario%20Restaurante%20Bar!5e0!3m2!1ses-419!2sco!4v1763671807404!5m2!1ses-419!2sco',
    googleMapsLink: 'https://maps.app.goo.gl/vvx2d1DLHADMj89f8',
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
