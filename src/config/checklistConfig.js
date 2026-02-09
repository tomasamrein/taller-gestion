// src/config/checklistConfig.js

export const CHECKLIST_CATEGORIES = [
    {
      id: 'luces',
      title: '💡 Luces',
      items: [
        { name: 'Luces Bajas' },
        { name: 'Luces Altas' },
        { name: 'Posición / Patente' },
        { name: 'Freno' },
        { name: 'Retroceso' },
        { name: 'Intermitentes' },
        { name: 'Interior Cabina' }
      ]
    },
    {
      id: 'motor',
      title: '⚡ Motor y Batería',
      items: [
        { name: 'Nivel Carga Batería', inputType: 'number', unit: 'Volts', placeholder: '12.4' }, // INPUT NUMÉRICO
        { name: 'Estado de Batería' },
        { name: 'Nivel de Aceite', inputType: 'level' }, // BARRA DE NIVEL
        { name: 'Nivel de Refrigerante', inputType: 'level' },
        { name: 'Líquido Dirección', inputType: 'level' },
        { name: 'Correa Distribución' },
        { name: 'Correa Poly-V' },
        { name: 'Bujías y Cables' },
        { name: 'Mangueras Radiador' },
        { name: 'Fugas de Fluidos', inputType: 'text', placeholder: '¿Dónde pierde?' }, // TEXTO
        { name: 'Etiqueta Último Servicio', inputType: 'text', placeholder: 'Km o Fecha del próximo cambio...' }
      ]
    },
    {
      id: 'frenos',
      title: '🛑 Frenos',
      items: [
        { name: 'Pastillas' },
        { name: 'Discos' },
        { name: 'Nivel Líquido Frenos', inputType: 'level' },
        { name: 'Freno de Mano' },
        { name: 'Fugas en Circuito' }
      ]
    },
    {
      id: 'tren_delantero',
      title: '🚜 Tren Delantero',
      items: [
        { name: 'Amortiguadores' },
        { name: 'Cremallera Dirección' },
        { name: 'Precaps' },
        { name: 'Extremos Dirección' },
        { name: 'Rótulas' },
        { name: 'Bujes Parrilla' },
        { name: 'Parrillas Suspensión' },
        { name: 'Barra Estabilizadora' },
        { name: 'Bieletas' },
        { name: 'Bulones y Aprietes' }
      ]
    },
    {
      id: 'tren_trasero',
      title: '🔩 Tren Trasero',
      items: [
        { name: 'Amortiguadores' },
        { name: 'Eje / Puente Trasero' },
        { name: 'Bujes' },
        { name: 'Barra Estabilizadora' },
        { name: 'Bieletas Traseras' },
        { name: 'Caño de Escape' }
      ]
    },
    {
      id: 'neumaticos',
      title: '🚗 Neumáticos',
      items: [
        { name: 'Estado Cubiertas' },
        { name: 'Estado Llantas' },
        { name: 'Calibración (Presión)', inputType: 'number', unit: 'PSI', placeholder: '30' },
        { name: 'Rueda de Auxilio' }
      ]
    },
    {
      id: 'electronica',
      title: '💻 Electrónica',
      items: [
        { name: 'Escaneo Computarizado', inputType: 'text', placeholder: 'Códigos de error...' }
      ]
    }
  ]
  
  export const STATUS_OPTIONS = {
    OK: { label: 'Bien', color: 'bg-green-500', value: 'ok', iconColor: 'text-green-600' },
    ATTENTION: { label: 'Regular', color: 'bg-yellow-400', value: 'attention', iconColor: 'text-yellow-500' },
    BAD: { label: 'Mal', color: 'bg-red-500', value: 'bad', iconColor: 'text-red-600' },
    NA: { label: 'N/A', color: 'bg-gray-200', value: 'na', iconColor: 'text-gray-400' }
  }