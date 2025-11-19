import { Component, HostListener, signal } from '@angular/core';

interface NavItem {
  label: string;
  href: string;
  id: string;
}

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class headerComponent {
  // Señal para controlar el estado del menú móvil
  isMenuOpen = signal<boolean>(false);

  // Señal para el scroll (opcional - para efectos adicionales)
  isScrolled = signal<boolean>(false);

  // Items del menú de navegación
  navItems = signal<NavItem[]>([
    { label: 'Inicio', href: '#inicio', id: 'inicio' },
    { label: 'Historia', href: '#historia', id: 'historia' },
    { label: 'Detalles', href: '#detalles', id: 'detalles' },
    { label: 'Ubicación', href: '#ubicacion', id: 'ubicacion' },
    { label: 'RSVP', href: '#rsvp', id: 'rsvp' },
    { label: 'Galería', href: '#galeria', id: 'galeria' },
    { label: 'FAQ', href: '#faq', id: 'faq' },
    { label: 'Contacto', href: '#contacto', id: 'contacto' }
  ]);

  // Nombres de los novios
  groomName = signal<string>('Diego');
  brideName = signal<string>('Vale');

  constructor() {}

  // Toggle del menú hamburguesa
  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }
  // Cerrar menú al hacer clic en un enlace
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  // Navegación suave a secciones
  scrollToSection(event: Event, href: string): void {
    event.preventDefault();

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    // Cerrar menú después de navegar
    this.closeMenu();
  }

  // Detectar scroll para efectos en el header (opcional)
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled.set(scrollPosition > 100);
  }

  // Cerrar menú al hacer clic fuera (opcional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (this.isMenuOpen() &&
        menuToggle &&
        navMenu &&
        !menuToggle.contains(target) &&
        !navMenu.contains(target)) {
      this.closeMenu();
    }
  }

  // TrackBy para optimización
  trackByHref(index: number, item: NavItem): string {
    return item.href;
  }
}
