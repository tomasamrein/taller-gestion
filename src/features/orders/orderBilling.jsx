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

  // --- LÓGICA DE IMPRESIÓN (Versión Actualizada con CUIL/Email) ---
  const handlePrint = () => {
    // 1. Preparamos los datos
    const client = order.vehicles?.clients || {}
    
    // DEBUG: Mirá la consola (F12) para ver si llegan el email y cuil aquí.
    console.log("Datos Cliente para Imprimir:", client)

    // Nombre completo inteligente
    const clientName = (client.name && client.lastname) 
        ? `${client.name} ${client.lastname}` 
        : (client.full_name || 'Cliente Mostrador')

    const printWindow = window.open('', '', 'height=800,width=900')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Orden #${order.id} - ${clientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
            body { font-family: 'Roboto', sans-serif; padding: 20px; color: #334155; margin: 0; -webkit-print-color-adjust: exact; }
            
            /* Header Compacto */
            .header-container { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 4px solid ${TALLER_INFO.logo_color}; padding-bottom: 10px; }
            .company-info h1 { font-size: 24px; text-transform: uppercase; font-weight: 900; margin: 0; }
            .company-info h1 span { color: ${TALLER_INFO.logo_color}; }
            .company-info p { font-size: 12px; color: #64748b; margin: 2px 0; }
            
            .invoice-tag { background: ${TALLER_INFO.logo_color}; color: white; padding: 4px 10px; font-weight: bold; text-transform: uppercase; font-size: 12px; border-radius: 4px; display: inline-block; }
            
            /* Sección Cliente (Rediseñada para que entre todo) */
            .client-section { display: flex; gap: 20px; margin-bottom: 30px; }
            .box { flex: 1; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 5px solid #cbd5e1; }
            .box.highlight { border-left-color: ${TALLER_INFO.logo_color}; background: #fff7ed; }
            
            .box h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 800; }
            .box p.main { margin: 0 0 5px; font-size: 16px; font-weight: 700; color: #1e293b; text-transform: capitalize; }
            
            /* Lista de datos con iconos (simulados) */
            .data-list { font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 4px; }
            .data-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }
            .data-item strong { color: #64748b; }

            /* Tabla */
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead { background-color: #1e293b; color: white; }
            th { text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            
            /* Totales */
            .total-row.final { font-size: 20px; font-weight: 900; color: #0f172a; border-top: 2px solid ${TALLER_INFO.logo_color}; padding-top: 10px; }
            
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          
          <div class="header-container">
            <div class="company-info">
              <h1>${TALLER_INFO.nombre}</h1>
              <p>${TALLER_INFO.direccion} • ${TALLER_INFO.telefono}</p>
            </div>
            <div style="text-align: right;">
              <div class="invoice-tag">Orden #${order.id}</div>
              <div style="font-size: 12px; margin-top: 5px;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="client-section">
            <div class="box highlight">
              <h3>Cliente</h3>
              <p class="main">${clientName}</p>
              <div class="data-list">
                <div class="data-item">
                    <strong>Teléfono:</strong> <span>${client.phone || '-'}</span>
                </div>
                <div class="data-item">
                    <strong>Email:</strong> <span>${client.email || '-'}</span>
                </div>
                <div class="data-item">
                    <strong>CUIT/CUIL:</strong> <span>${client.cuil || '-'}</span>
                </div>
              </div>
            </div>
            
            <div class="box">
              <h3>Vehículo</h3>
              <p class="main">${order.vehicles?.brand} ${order.vehicles?.model}</p>
              <div class="data-list">
                <div class="data-item">
                    <strong>Patente:</strong> <span>${order.vehicles?.patent || order.vehicles?.plate}</span>
                </div>
                <div class="data-item">
                    <strong>Año:</strong> <span>${order.vehicles?.year || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 13px; color: #475569; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <strong>SOLICITUD:</strong> ${order.description}
          </div>

          <table>
            <thead>
              <tr>
                <th width="50%">Descripción</th>
                <th width="10%" style="text-align: center;">Cant.</th>
                <th width="20%" style="text-align: right;">Precio</th>
                <th width="20%" style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">$${Number(item.unit_price).toLocaleString()}</td>
                  <td style="text-align: right; font-weight: bold;">$${(item.unit_price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 200px; text-align: right;">
              <div class="total-row final">
                <span>TOTAL: $${totalOrden.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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