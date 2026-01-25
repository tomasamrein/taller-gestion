import { useEffect, useState } from 'react'
import { getOrderItems, addOrderItem } from '../../services/orderService'
import { Trash, Plus, Printer, DollarSign } from 'lucide-react'

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
  const [loading, setLoading] = useState(false)

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

  // --- NUEVO DISEÑO PROFESIONAL (ESTILO INDUSTRIAL) ---
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=900')
    printWindow.document.write(`
      <html>
        <head>
          <title>Presupuesto #${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            
            body { font-family: 'Roboto', sans-serif; padding: 40px; color: #334155; margin: 0; }
            
            /* Encabezado */
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #ea580c; padding-bottom: 20px; }
            .company-info h1 { margin: 0; font-size: 28px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .company-info h1 span { color: #ea580c; }
            .company-info p { margin: 5px 0 0; font-size: 13px; color: #64748b; }
            
            .invoice-details { text-align: right; }
            .invoice-tag { background: #ea580c; color: white; padding: 5px 15px; font-weight: bold; text-transform: uppercase; font-size: 14px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
            .invoice-meta { font-size: 13px; color: #64748b; font-weight: 500; }
            
            /* Cliente y Vehículo */
            .client-section { display: flex; gap: 40px; margin-bottom: 40px; }
            .box { flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #cbd5e1; }
            .box.highlight { border-left-color: #ea580c; background: #fff7ed; }
            
            .box h3 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; }
            .box p { margin: 0; font-size: 15px; font-weight: 500; color: #1e293b; line-height: 1.5; }
            .box .sub { font-size: 13px; color: #64748b; font-weight: 400; }
            
            /* Tabla */
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            thead { background-color: #1e293b; color: white; }
            th { text-align: left; padding: 12px 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            
            /* Totales */
            .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
            .total-box { width: 250px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
            .total-row.final { border-bottom: none; border-top: 2px solid #ea580c; color: #0f172a; font-size: 20px; font-weight: bold; margin-top: 10px; padding-top: 15px; }
            
            /* Footer */
            .footer { margin-top: 60px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #94a3b8; }
            
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          
          <div class="header-container">
            <div class="company-info">
              <h1>Taller <span>Mecánica</span></h1>
              <p>Servicio Automotriz Integral</p>
              <p>Santo Tomé, Santa Fe • Tel: (342) 000-0000</p>
            </div>
            <div class="invoice-details">
              <div class="invoice-tag">Presupuesto</div>
              <div class="invoice-meta">
                Fecha: ${new Date().toLocaleDateString()}<br>
                Orden #: ${order.id.toString().padStart(6, '0')}
              </div>
            </div>
          </div>

          <div class="client-section">
            <div class="box highlight">
              <h3>Cliente</h3>
              <p>${order.vehicles?.clients?.full_name}</p>
              <p class="sub">${order.vehicles?.clients?.phone || 'Sin teléfono'}</p>
            </div>
            <div class="box">
              <h3>Vehículo</h3>
              <p>${order.vehicles?.brand} ${order.vehicles?.model}</p>
              <p class="sub">Patente: <strong>${order.vehicles?.patent}</strong> • Año: ${order.vehicles?.year || '-'}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;">
            <strong style="color: #ea580c; font-size: 12px; text-transform: uppercase;">Diagnóstico / Solicitud:</strong>
            <p style="margin: 5px 0 0; font-size: 14px; color: #334155;">${order.description}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th width="50%">Descripción</th>
                <th width="15%">Tipo</th>
                <th width="10%" style="text-align: center;">Cant.</th>
                <th width="12%" style="text-align: right;">Precio Unit.</th>
                <th width="13%" style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-transform: capitalize; font-size: 12px; color: #64748b;">${item.item_type.replace('_', ' ')}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">$${item.unit_price}</td>
                  <td style="text-align: right; font-weight: 500;">$${item.unit_price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${totalOrden.toLocaleString()}</span>
              </div>
              <div class="total-row final">
                <span>TOTAL:</span>
                <span>$${totalOrden.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Documento no válido como factura fiscal. Presupuesto válido por 15 días.<br>
            Gracias por confiar en <strong>Taller Mecánica</strong>.
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // --- RENDERIZADO DEL MODAL (IGUAL QUE ANTES) ---
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="text-orange-500" size={20} /> Detalle de Costos
            </h2>
            <p className="text-xs text-gray-400">{order.vehicles?.brand} {order.vehicles?.model} - {order.vehicles?.patent}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow border border-slate-600"
              title="Imprimir Comprobante"
            >
              <Printer size={16} /> <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2 hover:bg-slate-800 rounded transition">✕</button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.item_type} (x{item.quantity})</p>
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