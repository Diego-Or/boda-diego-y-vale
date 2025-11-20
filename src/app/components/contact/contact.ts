import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContactPerson {
  icon: string;
  name: string;
  role: string;
  phone: string;
  waLink: string;
  igLink: string;
}

interface GiftRegistry {
  icon: string;
  title: string;
  items: string[];
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  standalone: true,
  templateUrl: 'contact.html',
  styleUrl: 'contact.scss'
})

export class contactComponent {
  // Señal con la información de los novios
  bride = signal<ContactPerson>({
    icon: '👰',
    name: 'Vale Ospina',
    role: 'La Novia',
    phone: '+57 3157405057',
    waLink: 'https://wa.me/573001234567?text=Hola,%20tengo%20una%20duda%20sobre%20la%20boda',
    igLink: 'https://www.instagram.com/danva_ospina/',
  });

  groom = signal<ContactPerson>({
    icon: '🤵',
    name: 'Diego Ortiz',
    role: 'El Novio',
    phone: '+57 3213101495',
    waLink: 'https://wa.me/573213101495?text=Hola,%20tengo%20una%20duda%20sobre%20la%20boda',
    igLink: 'https://www.instagram.com/diego_ortizcc/',

  });

  // Señal con información de regalos
  giftRegistry = signal<GiftRegistry>({
    icon: '💝',
    title: 'Lista de Regalos',
    items: [
      'Lluvia de Sobres',
      'Aportes a Nequi: 3213101495'
    ],
    buttonText: 'Ver listas',
    buttonLink: '#regalos'
  });

  // Computed signal para combinar toda la información de contacto
  allContacts = computed(() => [
    this.bride(),
    this.groom()
  ]);

  constructor() {}

  // Método para abrir instagram
  instaLink(igLink: string): void {
    window.open(igLink, '_blank');
  }

  // Método para abrir Whatsapp
  whatsappLink(phoneLink: string): void {
    window.open(phoneLink, '_blank');
  }

  trackByItem(index: number, item: string): string {
    return item;
  }

  // Método para copiar número de teléfono al portapapeles
  async copyPhone(phone: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(phone);
      alert(`Número copiado: ${phone}`);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  }
}
