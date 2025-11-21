// src/app/services/firebase.service.ts
import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';

export interface ConfirmacionFirebase {
  fecha: Date;
  nombre: string;
  celular: string;
  plato: string;
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

  /* Guardar una nueva confirmación en Firestore */
  async guardarConfirmacion(datos: {
    nombre: string;
    celular: string;
    plato: string;
  }): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      const confirmacion = {
        fecha: Timestamp.now(),
        nombre: datos.nombre.trim(),
        celular: datos.celular.trim(),
        plato: datos.plato
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

  /* Obtener todas las confirmaciones ordenadas por fecha */
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
          fecha: data['fecha'].toDate(),
          nombre: data['nombre'],
          celular: data['celular'],
          plato: data['plato']
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

  /* Verificar si un celular ya existe */
  async celularExiste(celular: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.db, 'confirmaciones'),
        where('celular', '==', celular.trim())
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;

    } catch (error) {
      console.error('❌ Error al verificar celular:', error);
      return false;
    }
  }

  /* Obtener estadísticas */
  async obtenerEstadisticas(): Promise<{
    total: number;
    porPlato: { [key: string]: number };
    ultimaConfirmacion: Date | null;
  }> {
    const confirmaciones = await this.obtenerConfirmaciones();

    // Contar por plato
    const porPlato: { [key: string]: number } = {};
    confirmaciones.forEach(conf => {
      porPlato[conf.plato] = (porPlato[conf.plato] || 0) + 1;
    });

    return {
      total: confirmaciones.length,
      porPlato,
      ultimaConfirmacion: confirmaciones.length > 0 ? confirmaciones[0].fecha : null
    };
  }

  /* Obtener confirmaciones para exportar a Excel */
  async obtenerConfirmacionesParaExcel(): Promise<Array<{
    'No.': number;
    'Fecha de Confirmación': string;
    'Nombre Completo': string;
    'Celular': string;
    'Plato Seleccionado': string;
  }>> {
    const confirmaciones = await this.obtenerConfirmaciones();

    // Mapeo de valores de plato a etiquetas legibles
    const platosLabels: { [key: string]: string } = {
      'plato1': 'Lomo de Res',
      'plato2': 'Salmón',
      'plato3': 'Pollo'
    };

    return confirmaciones.map((conf, index) => ({
      'No.': index + 1,
      'Fecha de Confirmación': conf.fecha.toLocaleString('es-CO'),
      'Nombre Completo': conf.nombre,
      'Celular': conf.celular,
      'Plato Seleccionado': platosLabels[conf.plato] || conf.plato
    }));
  }

  /* Buscar confirmaciones por nombre */
  async buscarPorNombre(nombre: string): Promise<ConfirmacionFirebase[]> {
    const confirmaciones = await this.obtenerConfirmaciones();
    const busqueda = nombre.toLowerCase();

    return confirmaciones.filter(c =>
      c.nombre.toLowerCase().includes(busqueda)
    );
  }

  /* Buscar por número de celular */
  async buscarPorCelular(celular: string): Promise<ConfirmacionFirebase | null> {
    try {
      const q = query(
        collection(this.db, 'confirmaciones'),
        where('celular', '==', celular.trim())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        fecha: data['fecha'].toDate(),
        nombre: data['nombre'],
        celular: data['celular'],
        plato: data['plato']
      };

    } catch (error) {
      console.error('❌ Error al buscar por celular:', error);
      return null;
    }
  }

  /* Obtener confirmaciones recientes (últimas 24 horas) */
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
          fecha: data['fecha'].toDate(),
          nombre: data['nombre'],
          celular: data['celular'],
          plato: data['plato']
        };
      });

    } catch (error) {
      console.error('❌ Error al obtener confirmaciones recientes:', error);
      return [];
    }
  }

  /* Obtener conteo por cada plato */
  async obtenerConteoPorPlato(): Promise<{ plato: string; cantidad: number; porcentaje: number }[]> {
    const confirmaciones = await this.obtenerConfirmaciones();
    const total = confirmaciones.length;

    if (total === 0) return [];

    const conteo: { [key: string]: number } = {
      'plato1': 0,
      'plato2': 0,
      'plato3': 0
    };

    confirmaciones.forEach(conf => {
      conteo[conf.plato] = (conteo[conf.plato] || 0) + 1;
    });

    const platosLabels: { [key: string]: string } = {
      'plato1': 'Lomo de Res',
      'plato2': 'Salmón',
      'plato3': 'Pollo'
    };

    return Object.entries(conteo).map(([key, cantidad]) => ({
      plato: platosLabels[key] || key,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100)
    }));
  }
}
