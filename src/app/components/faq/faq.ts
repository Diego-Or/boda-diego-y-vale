import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class faqComponent {
  // Señal con las preguntas frecuentes
  faqItems = signal<FAQItem[]>([
    {
      question: '¿Cuál es el código de vestimenta?',
      answer: `La vestimenta debe ser formal y elegante. DAMAS: se sugiere usar vestido largo o de cóctel, evitando colores muy claros. CABALLEROS: se recomienda traje completo, pero favor no usar tonos café o beige. Por favor, tengan esto en cuenta para no opacar a los novios.`,
      isOpen: false
    },
    {
      question: '¿Puedo llevar niños?',
      answer: 'Preferimos que la celebración sea un momento para adultos, pero comprendemos que algunos invitados podrían necesitar traer a sus hijos. Por favor, les pedimos amablemente que nos lo comuniquen con anticipación vía WhatsApp para coordinar mejor.',
      isOpen: false
    },
    {
      question: '¿Qué tipo de regalos prefieren?',
      answer: 'Tu presencia es nuestro mejor regalo. Sin embargo, agradeceremos mucho cualquier contribución para nuestra luna de miel y las futuras necesidades de nuestro hogar. Encontrarás más información en la sección de contacto.',
      isOpen: false
    },
    {
      question: '¿Qué hora tendrá la celebracíon?',
      answer: 'Se estima que la ceremonia comenzará a las 3:00 p.m. y se extenderá hasta las 9:00 p.m. Tendremos un brindis, palabras especiales, actividades, cena y muchas fotos para compartir momentos inolvidables juntos.',
      isOpen: false
    }
  ]);

  constructor() {}

  /**
   * Toggle para abrir/cerrar una pregunta
   * Cierra todas las demás preguntas (comportamiento acordeón)
   */
  toggleFAQ(index: number): void {
    this.faqItems.update(items =>
      items.map((item, i) => ({
        ...item,
        isOpen: i === index ? !item.isOpen : false
      }))
    );
  }

  /**
   * Abrir todas las preguntas
   */
  expandAll(): void {
    this.faqItems.update(items =>
      items.map(item => ({ ...item, isOpen: true }))
    );
  }

  /**
   * Cerrar todas las preguntas
   */
  collapseAll(): void {
    this.faqItems.update(items =>
      items.map(item => ({ ...item, isOpen: false }))
    );
  }

  /**
   * TrackBy para optimización del *ngFor
   */
  trackByQuestion(index: number, item: FAQItem): string {
    return item.question;
  }
}
