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
      answer: `
        La vestimenta debe ser formal y elegante.

        <br><br><b>DAMAS:</b> Se sugiere usar vestido largo o de cóctel, evitando colores muy claros.
        <br><b>CABALLEROS:</b> Se recomienda el traje completo con corbata
        <br><br>

        Se reservan tonos blancos, café, beige, crema, vino tinto<br>
        <span class="tag tag-white"></span><span class="tag tag-beige-1"></span><span class="tag tag-beige-2"></span><span class="tag tag-beige-3"></span><span class="tag tag-beige-4"></span><span class="tag tag-guinda"></span>`,
      isOpen: true
    },
    {
      question: '¿Puedo llevar niños?',
      answer: 'Preferimos que esta celebración sea un espacio especial para que los adultos puedan disfrutar tranquilamente. Agradecemos mucho su comprensión y cariño, y esperamos compartir con todos momentos inolvidables.',
      isOpen: false
    },
    {
      question: '¿Qué tipo de regalos prefieren?',
      answer: 'Tu presencia es nuestro mejor regalo. Sin embargo, agradeceremos mucho cualquier contribución para nuestra luna de miel y las futuras necesidades de nuestro hogar. Encontrarás más información abajo, en la sección de contacto.',
      isOpen: false
    },
    {
      question: '¿Qué horario tendrá la celebracíon?',
      answer: 'La ceremonia comenzará a las 2:00 p.m. y se extenderá hasta las 7:00 p.m. Tendremos un brindis, palabras especiales, actividades, cena y muchas fotos para compartir momentos inolvidables juntos.',
      isOpen: false
    },
    {
      question: '¿Puedo llevar alguien adicional?',
      answer: 'Nos encantaría que nos acompañaras con todos tus seres queridos, sin embargo la invitación es solamente para la persona que la recibe, si consideras que se trata de alguien cercano, por favor escríbenos y lo revisamos juntos.',
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
