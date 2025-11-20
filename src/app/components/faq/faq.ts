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
      answer: 'La vestimenta es formal/elegante. Para las damas sugerimos vestido largo o cocktail, y para los caballeros traje completo. Evita usar blanco o colores muy claros para no opacar a la novia.',
      isOpen: false
    },
    {
      question: '¿Puedo llevar niños?',
      answer: 'Preferimos que sea un evento solo para adultos, pero entendemos que algunos invitados pueden necesitar traer a sus hijos. Por favor confírmalo en el RSVP para que podamos hacer los arreglos necesarios.',
      isOpen: false
    },
    {
      question: '¿Habrá transporte desde la ceremonia a la recepción?',
      answer: 'Sí, tendremos buses que saldrán de la iglesia a las 7:30 PM para llevar a los invitados a la hacienda (15 minutos de trayecto). También habrá transporte de regreso al final de la noche.',
      isOpen: false
    },
    {
      question: '¿Qué tipo de regalos prefieren?',
      answer: 'Tu presencia es nuestro mejor regalo. Sin embargo, si deseas obsequiarnos algo, hemos creado una lista de bodas en Falabella y también aceptamos contribuciones para nuestra luna de miel. Encontrarás más detalles en la sección de contacto.',
      isOpen: false
    },
    {
      question: '¿Hasta qué hora dura la fiesta?',
      answer: 'La recepción comenzará a las 8:00 PM y se extenderá hasta las 2:00 AM. Habrá música, baile, cena y mucha diversión durante toda la noche.',
      isOpen: false
    }
  ]);

  // Título y subtítulo configurables
  title = signal<string>('Preguntas Frecuentes');
  subtitle = signal<string>('Todo lo que necesitas saber');

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
   * Abrir una pregunta específica sin cerrar las demás
   * (comportamiento alternativo)
   */
  toggleFAQMultiple(index: number): void {
    this.faqItems.update(items =>
      items.map((item, i) =>
        i === index ? { ...item, isOpen: !item.isOpen } : item
      )
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
   * Agregar una nueva pregunta
   */
  addFAQ(question: string, answer: string): void {
    this.faqItems.update(items => [
      ...items,
      { question, answer, isOpen: false }
    ]);
  }

  /**
   * Eliminar una pregunta
   */
  removeFAQ(index: number): void {
    this.faqItems.update(items =>
      items.filter((_, i) => i !== index)
    );
  }

  /**
   * Actualizar una pregunta existente
   */
  updateFAQ(index: number, question: string, answer: string): void {
    this.faqItems.update(items =>
      items.map((item, i) =>
        i === index ? { ...item, question, answer } : item
      )
    );
  }

  /**
   * TrackBy para optimización del *ngFor
   */
  trackByQuestion(index: number, item: FAQItem): string {
    return item.question;
  }

  /**
   * Actualizar título y subtítulo
   */
  updateHeaders(title: string, subtitle: string): void {
    this.title.set(title);
    this.subtitle.set(subtitle);
  }
}
