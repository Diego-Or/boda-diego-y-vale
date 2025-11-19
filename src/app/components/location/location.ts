import { Component, computed, signal} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface LocationInfo {
  title: string;
  icon: string;
  content: string | string[];
  type: 'address' | 'transport' | 'directions';
}

interface LocationData {
  mapUrl: string;
  googleMapsLink: string;
  address: {
    name: string;
    street: string;
    city: string;
  };
  parking: string;
  publicTransport: string;
  directions: string[];
}

@Component({
  selector: 'app-location',
  templateUrl: 'location.html',
  styleUrl: 'location.scss'
})

export class locationComponent {
  // Señal con los datos de ubicación
  locationData = signal<LocationData>({
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1405.1918018059519!2d-73.99605295415145!3d5.025187351737295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e406fd8749942e1%3A0x73582e10620b43c4!2sCra.%2015%20%23%208A-11%2C%20Zipaquir%C3%A1%2C%20Cundinamarca!5e0!3m2!1ses-419!2sco!4v1763488497372!5m2!1ses-419!2sco',
    googleMapsLink: 'https://maps.google.com/?q=Carrera+15+8A-11+Zipaquirá+Cundinamarca',
    address: {
      name: 'xxxxxxxxxxxxxx',
      street: 'Carrera xxxxxxxxxx',
      city: 'xxxxxxxxx, Cundinamarca'
    },
    parking: 'Parking disponible en xxxxxxxxxxxxxxxxxx',
    publicTransport: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    directions: [
      'Desde Bogotá, toma la Autopista Norte',
      'Continúa hasta Zipaquirá (aproximadamente 50 km)',
      'Ingresa a xxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxx'
    ]
  });

  // Computed signal para la URL sanitizada del mapa
  safeMapUrl = computed<SafeResourceUrl>(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.locationData().mapUrl
    );
  });

  // Computed signal para las tarjetas de información
  infoCards = computed<LocationInfo[]>(() => {
    const data = this.locationData();
    return [
      {
        title: 'Dirección completa',
        icon: '📍',
        content: [
          data.address.name,
          data.address.street,
          data.address.city,
        ],
        type: 'address' as const
      },
      {
        title: 'Transporte',
        icon: '🚗',
        content: [
          `En auto: ${data.parking}`,
          `Transporte público: ${data.publicTransport}`
        ],
        type: 'transport' as const
      },
      {
        title: 'Indicaciones',
        icon: 'ℹ️',
        content: data.directions,
        type: 'directions' as const
      }
    ];
  });

  constructor(private sanitizer: DomSanitizer) {}

  // Método para actualizar la ubicación completa
  updateLocation(newData: Partial<LocationData>): void {
    this.locationData.update(current => ({
      ...current,
      ...newData
    }));
  }

  // Método para actualizar solo la dirección
  updateAddress(address: Partial<LocationData['address']>): void {
    this.locationData.update(current => ({
      ...current,
      address: { ...current.address, ...address }
    }));
  }

  // Método para abrir Google Maps
  openGoogleMaps(): void {
    window.open(this.locationData().googleMapsLink, '_blank');
  }

  // Método para obtener direcciones formateadas
  getFormattedAddress(): string {
    const addr = this.locationData().address;
    return `${addr.name}, ${addr.street}, ${addr.city}`;
  }

  // TrackBy para la lista de direcciones
  trackByIndex(index: number): number {
    return index;
  }

  // Método para determinar si el contenido es un array
  isArray(content: string | string[]): boolean {
    return Array.isArray(content);
  }

  // Método para obtener contenido como array
  getContentAsArray(content: string | string[]): string[] {
    return Array.isArray(content) ? content : [content];
  }
}
