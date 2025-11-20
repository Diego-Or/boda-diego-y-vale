import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface RSVPData {
  fecha: string;
  nombre: string;
  documento: string;
  tieneAlergias: boolean;
  mensaje: string;
}

interface RSVPConfig {
  deadline: Date;
  title: string;
  subtitle: string;
}

// Importar la librería XLSX (debe estar en el index.html o instalada)
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-rsvp',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'rsvp.html',
  styleUrl: 'rsvp.scss'
})

export class rsvpComponent implements OnInit{
  // Señales
  confirmaciones = signal<RSVPData[]>([]);
  isLoading = signal<boolean>(false);
  showSuccessMessage = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Configuración del RSVP
  config = signal<RSVPConfig>({
    deadline: new Date('2026-05-15'),
    title: 'Confirma tu Asistencia',
    subtitle: 'Por favor confirma antes del xx de xxxxxxxxxx de 2026'
  });

  // Computed signals
  confirmacionesCount = computed(() => this.confirmaciones().length);

  formattedDeadline = computed(() => {
    return this.config().deadline.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  isDeadlinePassed = computed(() => {
    return new Date() > this.config().deadline;
  });

  // Reactive Form
  rsvpForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.rsvpForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      alergias: [false],
      mensaje: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarConfirmaciones();
  }

  // Cargar confirmaciones desde localStorage
  async cargarConfirmaciones(): Promise<void> {
    try {
      const data = localStorage.getItem('confirmaciones-boda');
      if (data) {
        this.confirmaciones.set(JSON.parse(data));
        console.log('Confirmaciones cargadas:', this.confirmaciones().length);
      }
    } catch (error) {
      console.log('No hay confirmaciones previas:', error);
      this.confirmaciones.set([]);
    }
  }

  // Guardar confirmaciones en localStorage
  async guardarConfirmaciones(): Promise<void> {
    try {
      localStorage.setItem('confirmaciones-boda', JSON.stringify(this.confirmaciones()));
      console.log('Confirmaciones guardadas exitosamente');
    } catch (error) {
      console.error('Error al guardar confirmaciones:', error);
      throw error;
    }
  }

  // Validar si el documento ya existe
  documentoYaExiste(documento: string): boolean {
    return this.confirmaciones().some(conf => conf.documento === documento);
  }

  // Submit del formulario
  async onSubmit(): Promise<void> {
    if (this.rsvpForm.invalid) {
      this.markFormGroupTouched(this.rsvpForm);
      return;
    }

    const formValue = this.rsvpForm.value;

    // Validar documento duplicado
    if (this.documentoYaExiste(formValue.documento)) {
      this.errorMessage.set('Este documento ya está registrado. Si necesitas modificar tu confirmación, contáctanos.');
      setTimeout(() => this.errorMessage.set(''), 5000);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Crear objeto de confirmación
      const confirmacion: RSVPData = {
        fecha: new Date().toLocaleString('es-CO'),
        nombre: formValue.nombre.trim(),
        documento: formValue.documento.trim(),
        tieneAlergias: formValue.alergias,
        mensaje: formValue.mensaje.trim() || 'Sin mensaje'
      };

      // Agregar a la lista
      this.confirmaciones.update(current => [...current, confirmacion]);

      // Guardar en storage
      await this.guardarConfirmaciones();

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

  // Descargar Excel
  async descargarExcel(): Promise<void> {
    await this.cargarConfirmaciones(); // Recargar datos más recientes

    if (this.confirmaciones().length === 0) {
      alert('No hay confirmaciones registradas aún.');
      return;
    }

    try {
      // Preparar datos para Excel
      const datosExcel = this.confirmaciones().map((conf, index) => ({
        'No.': index + 1,
        'Fecha de Confirmación': conf.fecha,
        'Nombre Completo': conf.nombre,
        'Documento de Identidad': conf.documento,
        '¿Tiene Alergias?': conf.tieneAlergias ? 'Sí' : 'No',
        'Mensaje/Comentarios': conf.mensaje
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 5 },   // No.
        { wch: 20 },  // Fecha
        { wch: 30 },  // Nombre
        { wch: 20 },  // Documento
        { wch: 15 },  // Alergias
        { wch: 50 }   // Mensaje
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Confirmaciones');

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Confirmaciones_Boda_${fecha}.xlsx`);

      alert(`Se descargó el archivo con ${this.confirmaciones().length} confirmación(es).`);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Verifica que la librería XLSX esté cargada.');
    }
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

  get documento() {
    return this.rsvpForm.get('documento');
  }

  get alergias() {
    return this.rsvpForm.get('alergias');
  }

  get mensaje() {
    return this.rsvpForm.get('mensaje');
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<RSVPConfig>): void {
    this.config.update(current => ({
      ...current,
      ...newConfig
    }));
  }
}
