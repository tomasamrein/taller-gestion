import { useEffect, useState, useRef } from 'react'
import { getOrderItems, addOrderItem, updateOrderItem, deleteOrderItem } from '../../services/orderService' 
import { Trash2, Plus, Share2, Download, X, DollarSign, MessageCircle, Edit2, Check, Wrench, Package, FileCheck, Percent, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const TALLER_INFO = {
  nombre: import.meta.env.VITE_TALLER_NOMBRE || 'SERVICIO MECÁNICO Y AUXILIO',
  razon_social: import.meta.env.VITE_TALLER_RAZON_SOCIAL || 'Nombre del Taller',
  direccion: import.meta.env.VITE_TALLER_DIRECCION || 'Dirección',
  telefono: import.meta.env.VITE_TALLER_TELEFONO || 'XXX-XXX-XXXX',
  email: import.meta.env.VITE_TALLER_EMAIL || 'email@taller.com',
  cuit: import.meta.env.VITE_TALLER_CUIT || 'XX-XXXXXXXX-X',
  logo_color: import.meta.env.VITE_TALLER_COLOR || '#ea580c'
}

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  
  const [isBudgetFinalized, setIsBudgetFinalized] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [validityDays, setValidityDays] = useState(7)
  const [notes, setNotes] = useState('')

  const invoiceRef = useRef(null)

  const loadItems = async () => {
    const { data, error } = await getOrderItems(order.id)
    if (error) {
      toast.error('Error al cargar items')
      return
    }
    const sorted = (data || []).sort((a, b) => a.item_type.localeCompare(b.item_type))
    setItems(sorted)
  }

  useEffect(() => { loadItems() }, [order.id])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.description || !newItem.unit_price) return
    if (isBudgetFinalized) {
      toast.error('Finalizá el presupuesto para agregar items')
      return
    }
    setLoading(true)
    
    const { error } = await addOrderItem({ ...newItem, order_id: order.id })
    if (error) {
      toast.error('Error al agregar item')
    } else {
      setNewItem({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
      loadItems()
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (isBudgetFinalized) {
      toast.error('Primero deshacé la finalización del presupuesto')
      return
    }
    if(!window.confirm('¿Borrar item?')) return
    const { error } = await deleteOrderItem(id)
    if (error) {
      toast.error('Error al eliminar')
      return
    }
    loadItems()
  }

  const startEdit = (item) => {
    if (isBudgetFinalized) {
      toast.error('Primero deshacé la finalización del presupuesto')
      return
    }
    setEditingId(item.id)
    setEditValues({ ...item })
  }

  const saveEdit = async () => {
    const { error } = await updateOrderItem(editingId, {
        description: editValues.description,
        unit_price: editValues.unit_price,
        item_type: editValues.item_type,
        quantity: Number(editValues.quantity) || 1
    })
    if (error) {
      toast.error('Error al editar')
      return
    }
    setEditingId(null)
    loadItems()
    toast.success('Item actualizado')
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.unit_price) * Number(item.quantity || 1)), 0)
  const discountAmount = subtotal * (Number(discount) / 100)
  const totalOrden = subtotal - discountAmount

  const handleFinalizeBudget = () => {
    if (items.length === 0) {
      toast.error('Agregá al menos un item antes de finalizar')
      return
    }
    if (subtotal === 0) {
      toast.error('El presupuesto no puede tener total $0')
      return
    }
    setIsBudgetFinalized(true)
    toast.success('Presupuesto finalizado! Ya podés compartir o descargar.')
  }

  const handleUnfinalizeBudget = () => {
    if (!confirm('¿Deshacer la finalización? Podrás modificar los items.')) return
    setIsBudgetFinalized(false)
  }

  const generatePDFBlob = async () => {
    if (!invoiceRef.current) return null
    const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    return pdf
  }

  const getValidityDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + Number(validityDays))
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleShareWhatsApp = async () => {
    if (!isBudgetFinalized) {
      toast.error('Finalizá el presupuesto primero')
      return
    }
    setIsGenerating(true)
    const toastId = toast.loading('Generando PDF...')
    try {
      const pdf = await generatePDFBlob()
      const blob = pdf.output('blob')
      const clientName = order.vehicles?.clients?.lastname || 'Cliente'
      const fileName = `Presupuesto_${clientName}_${order.id}.pdf`
      const file = new File([blob], fileName, { type: 'application/pdf' })

      const mensaje = `Hola ${order.vehicles?.clients?.name || ''}! Te paso el presupuesto para ${order.vehicles?.brand} ${order.vehicles?.model}.\n\n💰 Total: $${totalOrden.toLocaleString()}\n⏰ Válido hasta: ${getValidityDate()}`
      
      const phone = order.vehicles?.clients?.phone
      if (phone) {
        let num = phone.replace(/\D/g, '')
        if (num.startsWith('0')) num = num.substring(1)
        if (!num.startsWith('54')) num = '549' + num
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Presupuesto Taller - Orden #${order.id}`,
          text: mensaje
        })
        toast.success('Enviado!', { id: toastId })
      } else {
        pdf.save(fileName)
        toast.success('PDF descargado', { id: toastId })
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al generar', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!isBudgetFinalized) {
      toast.error('Finalizá el presupuesto primero')
      return
    }
    setIsGenerating(true)
    try {
        const pdf = await generatePDFBlob()
        const clientName = order.vehicles?.clients?.lastname || 'Cliente'
        pdf.save(`Presupuesto_${clientName}_${order.id}.pdf`)
        toast.success('PDF Descargado')
    } catch (e) {
        toast.error('Error al descargar')
    } finally {
        setIsGenerating(false)
    }
  }

  const handleOpenChat = () => {
      const phone = order.vehicles?.clients?.phone
      if (!phone) return toast.error('El cliente no tiene teléfono')
      let num = phone.replace(/\D/g, '')
      if (num.startsWith('0')) num = num.substring(1)
      if (!num.startsWith('54')) num = '549' + num
      const text = `Hola ${order.vehicles?.clients?.name || ''}, te paso el presupuesto del ${order.vehicles?.model}. Total: $${totalOrden.toLocaleString()}`
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-900 text-white p-3 flex flex-col gap-3 border-b-4 border-orange-500 shrink-0">
          <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="text-orange-500" size={20} /> Costos y Presupuesto
                </h2>
                <p className="text-xs text-gray-400">Orden #{order.id} - {order.vehicles?.brand} {order.vehicles?.model}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white px-2 rounded"><X size={24}/></button>
          </div>

          {isBudgetFinalized ? (
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck size={20} />
                <span className="font-bold text-sm">Presupuesto Finalizado</span>
              </div>
              <button onClick={handleUnfinalizeBudget} className="text-xs bg-green-700 px-3 py-1 rounded hover:bg-green-800">
                Deshacer
              </button>
            </div>
          ) : (
            <div className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="font-bold text-sm">Modo Borrador - Finalizá para compartir</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
          <div className="space-y-3 mb-6">
             {items.length === 0 ? (
               <p className="text-gray-400 text-center py-8 italic border-2 border-dashed border-gray-200 rounded-lg">
                 Agregá items al presupuesto
               </p>
             ) : (
               items.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
                   
                   {editingId === item.id ? (
                       <div className="flex flex-col gap-2 animate-fade-in">
                           <div className="flex gap-2">
                               <select 
                                 value={editValues.item_type} 
                                 onChange={e => setEditValues({...editValues, item_type: e.target.value})}
                                 className="text-xs border p-1 rounded bg-gray-50"
                               >
                                   <option value="repuesto">Repuesto</option>
                                   <option value="mano_obra">Mano de Obra</option>
                               </select>
                               <input 
                                 value={editValues.description} 
                                 onChange={e => setEditValues({...editValues, description: e.target.value})}
                                 className="flex-1 border p-1 rounded text-sm"
                               />
                           </div>
                           <div className="flex gap-2 items-center">
                               <div className="flex items-center gap-1">
                                   <span className="text-xs text-gray-500">Cant:</span>
                                   <input 
                                     type="number"
                                     min="1"
                                     value={editValues.quantity || 1} 
                                     onChange={e => setEditValues({...editValues, quantity: Number(e.target.value)})}
                                     className="w-16 border p-1 rounded text-sm font-bold text-center"
                                   />
                               </div>
                               <div className="flex items-center gap-1 flex-1">
                                   <span className="text-xs text-gray-500">Precio:</span>
                                   <input 
                                     type="number"
                                     value={editValues.unit_price} 
                                     onChange={e => setEditValues({...editValues, unit_price: Number(e.target.value)})}
                                     className="flex-1 border p-1 rounded text-sm font-bold"
                                   />
                               </div>
                               <button onClick={saveEdit} className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200"><Check size={16}/></button>
                               <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-500 p-1.5 rounded hover:bg-gray-200"><X size={16}/></button>
                           </div>
                       </div>
                   ) : (
                       <div className="flex justify-between items-center">
                         <div className="flex items-start gap-3">
                             <div className={`p-2 rounded-full ${item.item_type === 'mano_obra' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                 {item.item_type === 'mano_obra' ? <Wrench size={16}/> : <Package size={16}/>}
                             </div>
                             <div>
                                 <p className="font-bold text-gray-800 text-sm leading-tight">{item.description}</p>
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                     {item.item_type?.replace('_', ' ')} {item.quantity > 1 ? `x${item.quantity}` : ''}
                                 </p>
                             </div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                             <span className="font-bold text-gray-800 font-mono text-lg">${(Number(item.unit_price) * Number(item.quantity || 1)).toLocaleString()}</span>
                             {!isBudgetFinalized && (
                               <div className="flex gap-1">
                                   <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                                   <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                               </div>
                             )}
                         </div>
                       </div>
                   )}
                </div>
             ))
             )}
          </div>
        </div>

        <div className="bg-white border-t p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-10">
            <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total Presupuestado</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">$ {totalOrden.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center mb-2 px-2 text-sm text-green-600 font-bold">
                <span>Descuento ({discount}%)</span>
                <span>-${discountAmount.toLocaleString()}</span>
              </div>
            )}

            {!isBudgetFinalized && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3 px-2">
                  <div>
                    <label className="text-xs text-gray-500 font-bold flex items-center gap-1 mb-1">
                      <Percent size={12} /> Descuento %
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={discount} 
                      onChange={e => setDiscount(Number(e.target.value))}
                      className="w-full border p-2 rounded-lg text-sm font-bold text-center"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold flex items-center gap-1 mb-1">
                      <Clock size={12} /> Válido (días)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30" 
                      value={validityDays} 
                      onChange={e => setValidityDays(Number(e.target.value))}
                      className="w-full border p-2 rounded-lg text-sm font-bold text-center"
                    />
                  </div>
                </div>

                <div className="mb-3 px-2">
                  <label className="text-xs text-gray-500 font-bold mb-1 block">Notas / Observaciones</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    className="w-full border p-2 rounded-lg text-sm resize-none"
                    rows={2}
                    placeholder="Ej: Precios incluyen IVA. Garantía 30 días."
                  />
                </div>
              </>
            )}

            {!isBudgetFinalized ? (
              <>
                <form onSubmit={handleAdd} className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
                    <div className="flex gap-2 mb-2">
                        <select 
                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg p-2 outline-none focus:ring-2 focus:ring-orange-500 font-bold uppercase"
                            value={newItem.item_type}
                            onChange={e => setNewItem({...newItem, item_type: e.target.value})}
                        >
                            <option value="repuesto">Repuesto</option>
                            <option value="mano_obra">Mano Obra</option>
                        </select>
                        <input 
                            className="flex-1 bg-white border border-gray-300 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" 
                            placeholder="Descripción..." 
                            value={newItem.description} 
                            onChange={e => setNewItem({...newItem, description: e.target.value})} 
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                            <input 
                                className="w-full bg-white border border-gray-300 pl-6 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold" 
                                type="number" 
                                placeholder="Precio" 
                                value={newItem.unit_price} 
                                onChange={e => setNewItem({...newItem, unit_price: Number(e.target.value)})} 
                            />
                        </div>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-gray-400 font-bold text-xs">Cant</span>
                            <input 
                                className="w-full bg-white border border-gray-300 pl-10 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 font-bold text-center" 
                                type="number" 
                                min="1"
                                value={newItem.quantity} 
                                onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} 
                            />
                        </div>
                        <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-4 rounded-lg font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-1">
                            <Plus size={18}/> 
                        </button>
                    </div>
                </form>

                <button 
                  onClick={handleFinalizeBudget}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <FileCheck size={18} /> Finalizar Presupuesto
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleShareWhatsApp} disabled={isGenerating} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow disabled:opacity-50">
                  {isGenerating ? '...' : <><Share2 size={16} /> Enviar PDF</>}
                </button>
                <button onClick={handleOpenChat} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
                  <MessageCircle size={16} />
                </button>
                <button onClick={handleDownload} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
                  <Download size={16} />
                </button>
              </div>
            )}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm', minHeight: '297mm', background: 'white' }}>
         <div ref={invoiceRef} className="p-12 text-slate-800 font-sans" style={{ width: '100%' }}>
            
            <div className="flex justify-between border-b-4 border-orange-500 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">{TALLER_INFO.nombre}</h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{TALLER_INFO.razon_social}</p>
                    <p className="text-sm text-gray-500">Dirección: {TALLER_INFO.direccion}</p>
                    <p className="text-sm text-gray-500">Teléfono: {TALLER_INFO.telefono}</p>
                    <p className="text-sm text-gray-500">CUIT: {TALLER_INFO.cuit}</p>
                </div>
                <div className="text-right">
                    <div className="bg-orange-600 text-white px-6 py-2 font-bold rounded-lg inline-block mb-2 text-sm tracking-wide">PRESUPUESTO</div>
                    <p className="text-lg font-bold text-gray-700">Orden #{order.id}</p>
                    <p className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString()}</p>
                    {validityDays > 0 && (
                      <p className="text-sm text-red-600 font-bold mt-2">Válido hasta: {getValidityDate()}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-10 mb-10">
                <div className="flex-1 bg-gray-50 p-6 rounded-lg border-l-8 border-orange-500">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Cliente</h3>
                    <p className="font-bold text-xl capitalize text-slate-900 mb-2">{order.vehicles?.clients?.name || order.vehicles?.clients?.full_name} {order.vehicles?.clients?.lastname}</p>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600"><strong>Tel:</strong> {order.vehicles?.clients?.phone || '-'}</p>
                        <p className="text-sm text-gray-600"><strong>Email:</strong> {order.vehicles?.clients?.email || '-'}</p>
                        <p className="text-sm text-gray-600"><strong>CUIT/CUIL:</strong> {order.vehicles?.clients?.cuil || '-'}</p>
                    </div>
                </div>
                <div className="flex-1 bg-gray-50 p-6 rounded-lg border-l-8 border-gray-300">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Vehículo</h3>
                    <p className="font-bold text-xl text-slate-900 mb-2">{order.vehicles?.brand} {order.vehicles?.model}</p>
                    <p className="text-sm text-gray-600">Patente: <strong>{order.vehicles?.patent || order.vehicles?.plate}</strong></p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <tr>
                        <th className="py-4 px-6 text-left">Descripción</th>
                        <th className="py-4 px-6 text-center">Tipo</th>
                        <th className="py-4 px-6 text-center">Cant.</th>
                        <th className="py-4 px-6 text-right">Precio Unit.</th>
                        <th className="py-4 px-6 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                            <td className="py-4 px-6 font-medium">{item.description}</td>
                            <td className="py-4 px-6 text-center text-xs uppercase font-bold text-gray-400">{item.item_type?.replace('_', ' ')}</td>
                            <td className="py-4 px-6 text-center">{item.quantity || 1}</td>
                            <td className="py-4 px-6 text-right">${Number(item.unit_price).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right font-bold text-slate-900">${(Number(item.unit_price) * Number(item.quantity || 1)).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-8">
                <div className="w-80">
                    <div className="flex justify-between py-2 text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between py-2 text-green-600 font-bold">
                          <span>Descuento ({discount}%)</span>
                          <span>-${discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-4 text-3xl font-black text-slate-900 items-end border-t-2 border-orange-500 pt-4">
                        <span className="text-lg font-bold text-gray-400 mb-1">TOTAL</span>
                        <span>${totalOrden.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {notes && (
              <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
                <h4 className="font-bold text-gray-700 text-sm mb-2">Observaciones:</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
              </div>
            )}
            
            <div className="mt-8 text-center text-xs text-gray-400 uppercase">Documento no válido como factura fiscal. Válido por {validityDays} días.</div>
         </div>
      </div>
    </div>
  )
}
