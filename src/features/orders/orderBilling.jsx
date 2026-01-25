import { useEffect, useState } from 'react'
import { getOrderItems, addOrderItem } from '../../services/orderService'
import { Trash, Plus, Printer } from 'lucide-react' // <--- Importamos Printer

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    const data = await getOrderItems(order.id)
    setItems(data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.description || !newItem.unit_price) return
    
    await addOrderItem({ ...newItem, order_id: order.id })
    setNewItem({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' }) 
    loadItems()
  }

  const totalOrden = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)

  // --- FUNCIÓN DE IMPRESIÓN (LA MAGIA) ---
  const handlePrint = () => {
    // 1. Abrimos una ventana nueva en blanco
    const printWindow = window.open('', '', 'height=600,width=800')
    
    // 2. Escribimos el HTML del comprobante (Diseño minimalista y profesional)
    printWindow.document.write(`
      <html>
        <head>
          <title>Presupuesto - ${order.vehicles?.patent}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563EB; }
            .info-taller { text-align: right; font-size: 12px; color: #666; }
            .info-cliente { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 1px solid #ddd; padding: 10px; color: #666; font-size: 12px; uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row { font-size: 18px; font-weight: bold; text-align: right; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TALLER MECÁNICA</div>
            <div class="info-taller">
              Santo Tomé, Santa Fe<br>
              Tel: 342-000-0000<br>
              Fecha: ${new Date().toLocaleDateString()}
            </div>
          </div>

          <div class="info-cliente">
            <strong>Cliente:</strong> ${order.vehicles?.clients?.full_name}<br>
            <strong>Vehículo:</strong> ${order.vehicles?.brand} ${order.vehicles?.model} (${order.vehicles?.year})<br>
            <strong>Patente:</strong> ${order.vehicles?.patent}<br>
            <strong>Diagnóstico:</strong> ${order.description}
          </div>

          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Cant.</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-transform: capitalize;">${item.item_type.replace('_', ' ')}</td>
                  <td>${item.quantity}</td>
                  <td style="text-align: right;">$${item.unit_price}</td>
                  <td style="text-align: right;">$${item.unit_price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-row">
            TOTAL A PAGAR: $${totalOrden.toLocaleString()}
          </div>

          <div class="footer">
            Presupuesto válido por 15 días. Gracias por su confianza.
          </div>
        </body>
      </html>
    `)

    // 3. Mandamos a imprimir y cerramos
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header con Botón de Imprimir */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Detalle de Costos</h2>
            <p className="text-xs text-slate-400">{order.vehicles?.brand} {order.vehicles?.model}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center gap-2 transition"
              title="Imprimir Comprobante"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
          </div>
        </div>

        {/* Cuerpo (Igual que antes) */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          <div className="space-y-2 mb-6">
            {items.length === 0 ? (
              <p className="text-center text-gray-400 italic py-4">No hay costos cargados aún.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{item.description}</p>
                    <p className="text-xs text-gray-500 uppercase">{item.item_type} (x{item.quantity})</p>
                  </div>
                  <span className="font-bold text-gray-700">${(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
            <span className="text-gray-600 font-bold">TOTAL A COBRAR:</span>
            <span className="text-2xl font-bold text-green-600">${totalOrden.toLocaleString()}</span>
          </div>

          <form onSubmit={handleAdd} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-bold text-blue-800 mb-2">Agregar Item</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input 
                placeholder="Descripción" 
                className="col-span-3 border p-2 rounded text-sm"
                value={newItem.description}
                onChange={e => setNewItem({...newItem, description: e.target.value})}
              />
              <select 
                className="border p-2 rounded text-sm"
                value={newItem.item_type}
                onChange={e => setNewItem({...newItem, item_type: e.target.value})}
              >
                <option value="repuesto">Repuesto</option>
                <option value="mano_obra">Mano de Obra</option>
              </select>
              <input 
                type="number" 
                placeholder="Precio $" 
                className="col-span-2 border p-2 rounded text-sm"
                value={newItem.unit_price}
                onChange={e => setNewItem({...newItem, unit_price: e.target.value})}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 flex justify-center gap-2">
              <Plus size={18} /> Agregar Costo
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}