import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';

export interface ConfirmacionFirebase {
  id?: string;
  fecha: Date;
  nombre: string;
  documento: string;
  tieneAlergias: boolean;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;

  // Señales para estados
  isLoading = signal<boolean>(false);
  error = signal<string>('');

  // ⚠️ REEMPLAZA ESTA CONFIGURACIÓN CON LA TUYA DE FIREBASE CONSOLE
  private firebaseConfig = {
    apiKey: "AIzaSyAWmf5eV2DBOsuZtyMstCqHup4gKK5qGh0",
    authDomain: "boda-diegoyvale.firebaseapp.com",
    projectId: "boda-diegoyvale",
    storageBucket: "boda-diegoyvale.firebasestorage.app",
    messagingSenderId: "960707511784",
    appId: "1:960707511784:web:6b6596a7b296349220105d"
  };

  constructor() {
    // Inicializar Firebase
    this.app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(this.app);
    console.log('🔥 Firebase inicializado correctamente');
  }

  /**
   * Guardar una nueva confirmación en Firestore
   */
  async guardarConfirmacion(datos: {
    nombre: string;
    documento: string;
    tieneAlergias: boolean;
    mensaje: string;
  }): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      const confirmacion = {
        fecha: Timestamp.now(),
        nombre: datos.nombre.trim(),
        documento: datos.documento.trim(),
        tieneAlergias: datos.tieneAlergias,
        mensaje: datos.mensaje.trim() || 'Sin mensaje'
      };

      const docRef = await addDoc(collection(this.db, 'confirmaciones'), confirmacion);

      console.log('✅ Confirmación guardada con ID:', docRef.id);
      return true;

    } catch (error: any) {
      console.error('❌ Error al guardar confirmación:', error);
      this.error.set(error.message || 'Error al guardar en Firebase');
      return false;

    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtener todas las confirmaciones ordenadas por fecha
   */
  async obtenerConfirmaciones(): Promise<ConfirmacionFirebase[]> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      const q = query(
        collection(this.db, 'confirmaciones'),
        orderBy('fecha', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const confirmaciones: ConfirmacionFirebase[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fecha: data['fecha'].toDate(),
          nombre: data['nombre'],
          documento: data['documento'],
          tieneAlergias: data['tieneAlergias'],
          mensaje: data['mensaje']
        };
      });

      console.log(`✅ ${confirmaciones.length} confirmaciones obtenidas de Firebase`);
      return confirmaciones;

    } catch (error: any) {
      console.error('❌ Error al obtener confirmaciones:', error);
      this.error.set(error.message || 'Error al obtener datos');
      return [];

    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Verificar si un documento ya existe
   */
  async documentoExiste(documento: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.db, 'confirmaciones'),
        where('documento', '==', documento.trim())
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;

    } catch (error) {
      console.error('❌ Error al verificar documento:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    conAlergias: number;
    sinAlergias: number;
    ultimaConfirmacion: Date | null;
  }> {
    const confirmaciones = await this.obtenerConfirmaciones();

    return {
      total: confirmaciones.length,
      conAlergias: confirmaciones.filter(c => c.tieneAlergias).length,
      sinAlergias: confirmaciones.filter(c => !c.tieneAlergias).length,
      ultimaConfirmacion: confirmaciones.length > 0 ? confirmaciones[0].fecha : null
    };
  }

  /**
   * Obtener confirmaciones para exportar a Excel
   */
  async obtenerConfirmacionesParaExcel(): Promise<Array<{
    'No.': number;
    'Fecha de Confirmación': string;
    'Nombre Completo': string;
    'Documento de Identidad': string;
    '¿Tiene Alergias?': string;
    'Mensaje/Comentarios': string;
  }>> {
    const confirmaciones = await this.obtenerConfirmaciones();

    return confirmaciones.map((conf, index) => ({
      'No.': index + 1,
      'Fecha de Confirmación': conf.fecha.toLocaleString('es-CO'),
      'Nombre Completo': conf.nombre,
      'Documento de Identidad': conf.documento,
      '¿Tiene Alergias?': conf.tieneAlergias ? 'Sí' : 'No',
      'Mensaje/Comentarios': conf.mensaje
    }));
  }

  /**
   * Buscar confirmaciones por nombre
   */
  async buscarPorNombre(nombre: string): Promise<ConfirmacionFirebase[]> {
    const confirmaciones = await this.obtenerConfirmaciones();
    const busqueda = nombre.toLowerCase();

    return confirmaciones.filter(c =>
      c.nombre.toLowerCase().includes(busqueda)
    );
  }

  /**
   * Obtener confirmaciones recientes (últimas 24 horas)
   */
  async obtenerConfirmacionesRecientes(): Promise<ConfirmacionFirebase[]> {
    try {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      const q = query(
        collection(this.db, 'confirmaciones'),
        where('fecha', '>=', Timestamp.fromDate(ayer)),
        orderBy('fecha', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fecha: data['fecha'].toDate(),
          nombre: data['nombre'],
          documento: data['documento'],
          tieneAlergias: data['tieneAlergias'],
          mensaje: data['mensaje']
        };
      });

    } catch (error) {
      console.error('❌ Error al obtener confirmaciones recientes:', error);
      return [];
    }
  }
}
