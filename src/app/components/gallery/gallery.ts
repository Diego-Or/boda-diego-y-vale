import { Component, computed, effect, HostListener, signal } from '@angular/core';

interface GalleryImage {
  src: string;
  alt: string;
  index: number;
}


@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.html',
  styleUrl: 'gallery.scss'
})
export class galleryComponent {

  images = signal<GalleryImage[]>([
    { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600', alt: 'Foto 1', index: 0 },
    { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600', alt: 'Foto 3', index: 2 },
    { src: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600', alt: 'Foto 4', index: 3 },
    { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600', alt: 'Foto 5', index: 4 },
    { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600', alt: 'Foto 6', index: 5 },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600', alt: 'Foto 9', index: 8 }
  ]);

  currentImageIndex = signal<number>(0);
  isLightboxActive = signal<boolean>(false);

  // Computed signals
  currentImage = computed(() => {
    const index = this.currentImageIndex();
    return this.images()[index];
  });

  counter = computed(() => {
    const current = this.currentImageIndex() + 1;
    const total = this.images().length;
    return `${current} / ${total}`;
  });

  // Effect para manejar el overflow del body
  constructor() {
    effect(() => {
      if (this.isLightboxActive()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar el overflow del body al destruir el componente
    document.body.style.overflow = 'auto';
  }

  // Métodos para controlar el lightbox
  openLightbox(index: number): void {
    this.currentImageIndex.set(index);
    this.isLightboxActive.set(true);
  }

  closeLightbox(): void {
    this.isLightboxActive.set(false);
  }

  showPrevImage(): void {
    const totalImages = this.images().length;
    const newIndex = (this.currentImageIndex() - 1 + totalImages) % totalImages;
    this.currentImageIndex.set(newIndex);
  }

  showNextImage(): void {
    const totalImages = this.images().length;
    const newIndex = (this.currentImageIndex() + 1) % totalImages;
    this.currentImageIndex.set(newIndex);
  }

  onBackgroundClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('lightbox')) {
      this.closeLightbox();
    }
  }

  // Navegación con teclado
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.isLightboxActive()) {
      switch (event.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.showPrevImage();
          break;
        case 'ArrowRight':
          this.showNextImage();
          break;
      }
    }
  }

  // Trackby para optimizar el *ngFor
  trackByIndex(index: number, item: GalleryImage): number {
    return item.index;
  }
}

