import { useEffect, useState } from 'react'
import { getOrderItems, addOrderItem } from '../../services/orderService'
import { Trash, Plus, Printer, DollarSign } from 'lucide-react'

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
  const [loading, setLoading] = useState(false)

  // --- CONFIGURACIÓN DE TU TALLER (EDITALO ACÁ) ---
  const TALLER_INFO = {
    nombre: "TALLER MECÁNICA", // O el nombre que use Emi
    direccion: "Av. Completar 0000, Santo Tomé",
    telefono: "342-155-0000",
    email: "tallermecanica@email.com",
    logo_color: "#ea580c" // El naranja que le gustó
  }

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    const data = await getOrderItems(order.id)
    setItems(data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.description || !newItem.unit_price) return
    
    setLoading(true)
    await addOrderItem({ ...newItem, order_id: order.id })
    setNewItem({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' }) 
    await loadItems()
    setLoading(false)
  }

  const totalOrden = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)

// --- LÓGICA DE IMPRESIÓN (VERSION FINAL MÓVIL) ---
const handlePrint = () => {
  const client = order.vehicles?.clients || {}
  const clientName = (client.name && client.lastname) 
      ? `${client.name} ${client.lastname}` 
      : (client.full_name || 'Cliente Mostrador')

  // 1. Abrimos una pestaña en blanco REAL
  const printWindow = window.open('', '_blank');
  
  // Si el celular bloquea la popup, avisamos
  if (!printWindow) {
      alert("Por favor, permití las ventanas emergentes para ver la factura.");
      return;
  }

  // 2. Escribimos el contenido directo (sin Blobs)
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Orden_${order.id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
          
          body { 
              font-family: 'Roboto', sans-serif; 
              padding: 15px; 
              color: #334155; 
              margin: 0; 
              background: #f1f5f9;
          }
          
          /* Hoja simulada */
          .page {
              background: white;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }

          /* Header */
          .header-container { display: flex; flex-direction: column; gap: 10px; border-bottom: 4px solid ${TALLER_INFO.logo_color}; padding-bottom: 15px; margin-bottom: 20px; }
          @media (min-width: 600px) { .header-container { flex-direction: row; justify-content: space-between; align-items: flex-end; } }
          
          .company-info h1 { font-size: 24px; text-transform: uppercase; font-weight: 900; margin: 0; line-height: 1; }
          .company-info h1 span { color: ${TALLER_INFO.logo_color}; }
          .company-info p { font-size: 12px; color: #64748b; margin: 4px 0; }
          
          .invoice-tag { background: ${TALLER_INFO.logo_color}; color: white; padding: 4px 10px; font-weight: bold; text-transform: uppercase; font-size: 11px; border-radius: 4px; display: inline-block; }
          
          /* Botón Flotante para Celular (Sticky al fondo) */
          .print-bar {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 999;
              width: 90%;
              max-width: 400px;
          }
          .print-btn {
              width: 100%;
              background: #2563eb;
              color: white;
              border: none;
              padding: 15px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
          }
          
          /* Ocultar elementos de interfaz al imprimir */
          @media print { 
              body { background: white; padding: 0; }
              .page { box-shadow: none; margin: 0; padding: 0; width: 100%; max-width: none; }
              .print-bar { display: none !important; } /* Oculta el botón azul */
          }

          /* Cajas Cliente/Vehículo */
          .client-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
          @media (min-width: 600px) { .client-section { flex-direction: row; gap: 20px; } }

          .box { flex: 1; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #cbd5e1; }
          .box.highlight { border-left-color: ${TALLER_INFO.logo_color}; background: #fff7ed; }
          
          .box h3 { margin: 0 0 5px; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 800; }
          .box p.main { margin: 0 0 5px; font-size: 16px; font-weight: 700; color: #1e293b; text-transform: capitalize; }
          
          .data-item { font-size: 13px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 4px 0; }
          
          /* Tabla */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead { background-color: #1e293b; color: white; }
          th { text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .total-row { font-size: 20px; font-weight: 900; color: #0f172a; text-align: right; padding-top: 15px; border-top: 2px solid ${TALLER_INFO.logo_color}; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding-bottom: 80px; } /* Padding extra para que el botón no tape */
        </style>
      </head>
      <body>
        
        <div class="print-bar">
          <button onclick="window.print()" class="print-btn">
             🖨️ IMPRIMIR / PDF
          </button>
        </div>

        <div class="page">
          <div class="header-container">
              <div class="company-info">
              <h1>${TALLER_INFO.nombre}</h1>
              <p>${TALLER_INFO.direccion}<br>${TALLER_INFO.telefono}</p>
              </div>
              <div style="text-align: left; margin-top: 5px;">
              <div class="invoice-tag">Orden #${order.id}</div>
              <div style="font-size: 12px; margin-top: 4px; color: #64748b;">${new Date().toLocaleDateString()}</div>
              </div>
          </div>

          <div class="client-section">
              <div class="box highlight">
              <h3>Cliente</h3>
              <p class="main">${clientName}</p>
              <div class="data-item"><span>Tel:</span> <strong>${client.phone || '-'}</strong></div>
              <div class="data-item"><span>Email:</span> <strong>${client.email || '-'}</strong></div>
              <div class="data-item"><span>CUIT:</span> <strong>${client.cuil || '-'}</strong></div>
              </div>
              
              <div class="box">
              <h3>Vehículo</h3>
              <p class="main">${order.vehicles?.brand} ${order.vehicles?.model}</p>
              <div class="data-item"><span>Patente:</span> <strong>${order.vehicles?.patent || order.vehicles?.plate}</strong></div>
              <div class="data-item"><span>Año:</span> <strong>${order.vehicles?.year || '-'}</strong></div>
              </div>
          </div>

          <div style="background: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; margin-bottom: 20px; font-style: italic;">
              <strong>SOLICITUD:</strong> ${order.description}
          </div>

          <table>
              <thead>
              <tr>
                  <th width="45%">Descripción</th>
                  <th width="10%" class="text-center">Cant.</th>
                  <th width="20%" class="text-right">Unitario</th>
                  <th width="25%" class="text-right">Total</th>
              </tr>
              </thead>
              <tbody>
              ${items.map(item => `
                  <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">$${Number(item.unit_price).toLocaleString()}</td>
                  <td class="text-right"><strong>$${(item.unit_price * item.quantity).toLocaleString()}</strong></td>
                  </tr>
              `).join('')}
              </tbody>
          </table>

          <div class="total-row">
              TOTAL: $${totalOrden.toLocaleString()}
          </div>

          <div class="footer">
              Documento no válido como factura fiscal • Gracias por su confianza
          </div>
        </div>
        
        <script>
          // Intentar abrir el diálogo automáticamente al cargar
          setTimeout(function() {
              window.print();
          }, 1000);
        </script>
      </body>
    </html>
  `);
  
  // 3. Cerramos el documento para que el navegador sepa que terminó de cargar (IMPORTANTE PARA CELU)
  printWindow.document.close();
}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="text-orange-500" size={20} /> Detalle de Costos
            </h2>
            <p className="text-xs text-gray-400">Orden #{order.id}</p>
          </div>
          <div className="flex gap-2">
            {/* BOTÓN IMPRIMIR / DESCARGAR */}
            <button 
              onClick={handlePrint} 
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg transform active:scale-95"
              title="Abre vista previa para Imprimir o Guardar como PDF"
            >
              <Printer size={18} /> <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2 hover:bg-slate-800 rounded transition">✕</button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* ... (EL RESTO DEL CONTENIDO ES IGUAL AL QUE YA TENÍAS) ... */}
          <div className="space-y-2 mb-6">
            {items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-400 italic">No hay costos cargados aún.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 hover:bg-orange-50 p-2 rounded transition">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.item_type === 'mano_obra' ? 'Mano de Obra' : 'Repuesto'} (x{item.quantity})</p>
                  </div>
                  <span className="font-bold text-gray-700 font-mono">${(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
            <span className="text-slate-600 font-bold uppercase text-sm">Total a Cobrar</span>
            <span className="text-2xl font-bold text-green-600 tracking-tight">$ {totalOrden.toLocaleString()}</span>
          </div>

          <form onSubmit={handleAdd} className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
            <h3 className="text-xs font-bold text-orange-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Plus size={14} /> Agregar Item
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input 
                placeholder="Descripción" 
                className="col-span-3 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                value={newItem.description}
                onChange={e => setNewItem({...newItem, description: e.target.value})}
                autoFocus
              />
              <select 
                className="border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={newItem.item_type}
                onChange={e => setNewItem({...newItem, item_type: e.target.value})}
              >
                <option value="repuesto">Repuesto</option>
                <option value="mano_obra">Mano Obra</option>
              </select>
              <input 
                type="number" 
                placeholder="$ Precio" 
                className="col-span-2 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                value={newItem.unit_price}
                onChange={e => setNewItem({...newItem, unit_price: e.target.value})}
              />
            </div>
            <button disabled={loading} className="w-full bg-orange-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-orange-700 transition flex justify-center gap-2 shadow-md disabled:opacity-50">
              {loading ? 'Guardando...' : 'Agregar Costo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}