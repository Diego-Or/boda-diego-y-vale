// src/app/components/rsvp/rsvp.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';

interface RSVPData {
  fecha: string;
  nombre: string;
  celular: string;
  plato: string;
}

interface RSVPConfig {
  deadline: Date;
  title: string;
  subtitle: string;
}

interface PlatoOption {
  value: string;
  label: string;
  description: string;
}

// Importar la librería XLSX (debe estar en el index.html)
declare const XLSX: any;

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rsvp.html',
  styleUrls: ['./rsvp.scss']
})
export class rsvpComponent implements OnInit {
  // Señales
  confirmaciones = signal<RSVPData[]>([]);
  isLoading = signal<boolean>(false);
  showSuccessMessage = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Configuración del RSVP
  config = signal<RSVPConfig>({
    deadline: new Date('2026-05-15'),
    title: 'Confirma tu Asistencia',
    subtitle: 'Por favor confirma antes del 15 de mayo de 2026'
  });

  // Opciones de platos
  platosDisponibles = signal<PlatoOption[]>([
    {
      value: 'plato1',
      label: 'Plato 1: Lomo de Res',
      description: 'Lomo de res al vino tinto con papas gratinadas y vegetales asados'
    },
    {
      value: 'plato2',
      label: 'Plato 2: Salmón',
      description: 'Salmón a la parrilla con salsa de maracuyá, arroz de coco y espárragos'
    },
    {
      value: 'plato3',
      label: 'Plato 3: Pollo',
      description: 'Pechuga de pollo rellena de espinacas y queso con puré de papa y ensalada'
    }
  ]);

  // Computed signals
  confirmacionesCount = computed(() => this.confirmaciones().length);

  formattedDeadline = computed(() => {
    return this.config().deadline.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  isDeadlinePassed = computed(() => new Date() > this.config().deadline);

  // Reactive Form
  rsvpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    this.rsvpForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      celular: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      plato: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarConfirmaciones();
  }

  // Cargar confirmaciones desde Firebase
  async cargarConfirmaciones(): Promise<void> {
    try {
      const data = await this.firebaseService.obtenerConfirmaciones();
      console.log('buenas');

      // Convertir formato de Firebase a RSVPData
      const confirmaciones: RSVPData[] = data.map(conf => ({
        fecha: conf.fecha.toLocaleString('es-CO'),
        nombre: conf.nombre,
        celular: conf.celular,
        plato: conf.plato
      }));
      this.confirmaciones.set(confirmaciones);
      console.log('Confirmaciones cargadas desde Firebase:', confirmaciones.length);
    } catch (error) {
      console.error('Error al cargar confirmaciones:', error);
      this.confirmaciones.set([]);
    }
  }

  // Guardar confirmación en Firebase
  async guardarConfirmacion(datos: {
    nombre: string;
    celular: string;
    plato: string;
  }): Promise<boolean> {
    const success = await this.firebaseService.guardarConfirmacion(datos);

    if (!success) {
      throw new Error('No se pudo guardar en Firebase');
    }

    return true;
  }

  // Validar si el celular ya existe
  async celularYaExiste(celular: string): Promise<boolean> {
    return await this.firebaseService.celularExiste(celular);
  }

  // Submit del formulario
  async onSubmit(): Promise<void> {
    if (this.rsvpForm.invalid) {
      this.markFormGroupTouched(this.rsvpForm);
      return;
    }

    const formValue = this.rsvpForm.value;

    // Validar celular duplicado
    const existe = await this.celularYaExiste(formValue.celular);
    if (existe) {
      this.errorMessage.set('Este número de celular ya está registrado. Si necesitas modificar tu confirmación, contáctanos.');
      setTimeout(() => this.errorMessage.set(''), 5000);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Guardar directamente en Firebase
      await this.guardarConfirmacion({
        nombre: formValue.nombre.trim(),
        celular: formValue.celular.trim(),
        plato: formValue.plato
      });

      // Recargar confirmaciones para actualizar el contador
      await this.cargarConfirmaciones();

      // Mostrar mensaje de éxito
      this.showSuccessMessage.set(true);
      this.rsvpForm.reset();

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.showSuccessMessage.set(false);
      }, 5000);

    } catch (error) {
      console.error('Error al guardar confirmación:', error);
      this.errorMessage.set('Hubo un error al guardar tu confirmación. Por favor intenta de nuevo.');

    } finally {
      this.isLoading.set(false);
    }
  }

  // Descargar Excel con datos de Firebase
  async descargarExcel(): Promise<void> {
    if (this.confirmaciones().length === 0) {
      alert('No hay confirmaciones registradas aún.');
      return;
    }

    try {
      // Obtener datos formateados desde Firebase
      const datosExcel = await this.firebaseService.obtenerConfirmacionesParaExcel();

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 5 },   // No.
        { wch: 20 },  // Fecha
        { wch: 30 },  // Nombre
        { wch: 15 },  // Celular
        { wch: 50 }   // Plato
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Confirmaciones');

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Confirmaciones_Boda_${fecha}.xlsx`);

      alert(`Se descargó el archivo con ${datosExcel.length} confirmación(es).`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Verifica que la librería XLSX esté cargada.');
    }
  }

  // Obtener descripción del plato seleccionado
  getDescripcionPlato(platoValue: string): string {
    const plato = this.platosDisponibles().find(p => p.value === platoValue);
    return plato?.description || '';
  }

  // Helper para marcar todos los campos como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validación en el template
  get nombre() {
    return this.rsvpForm.get('nombre');
  }

  get celular() {
    return this.rsvpForm.get('celular');
  }

  get plato() {
    return this.rsvpForm.get('plato');
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<RSVPConfig>): void {
    this.config.update(current => ({
      ...current,
      ...newConfig
    }));
  }

  // Formatear número de celular mientras se escribe
  formatearCelular(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    this.rsvpForm.patchValue({ celular: value }, { emitEvent: false });
  }
}
