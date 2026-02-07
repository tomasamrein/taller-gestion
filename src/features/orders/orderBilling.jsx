import { useEffect, useState, useRef } from 'react'
import { getOrderItems, addOrderItem } from '../../services/orderService'
import { Trash, Plus, Share2, Download, X, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Referencia para la "Factura Fantasma"
  const invoiceRef = useRef(null)

  // --- TUS DATOS ---
  const TALLER_INFO = {
    nombre: "TALLER MECÁNICA",
    direccion: "Av. Completar 0000, Santa Fe",
    telefono: "342-155-0000",
    email: "tallermecanica@email.com",
    logo_color: "#ea580c"
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

  // --- MAGIA: GENERAR PDF Y COMPARTIR ---
  const generatePDFBlob = async () => {
    if (!invoiceRef.current) return null
    
    // 1. Capturamos la "Factura Fantasma" como imagen
    const canvas = await html2canvas(invoiceRef.current, { 
        scale: 2, // Mejor calidad
        useCORS: true, 
        backgroundColor: '#ffffff' 
    })
    
    // 2. Creamos el PDF A4
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    return pdf
  }

  const handleShare = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generando PDF...')
    
    try {
      const pdf = await generatePDFBlob()
      
      // Convertimos a archivo real
      const blob = pdf.output('blob')
      const file = new File([blob], `Orden_${order.id}.pdf`, { type: 'application/pdf' })

      // INTENTAMOS COMPARTIR (NATIVO DEL CELULAR)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Orden #${order.id} - ${TALLER_INFO.nombre}`,
          text: `Hola! Acá te adjunto el presupuesto de tu vehículo.`
        })
        toast.success('Abriendo WhatsApp...', { id: toastId })
      } else {
        // Fallback para PC (Descarga directa)
        pdf.save(`Orden_${order.id}.pdf`)
        toast.success('PDF Descargado (Tu dispositivo no soporta compartir directo)', { id: toastId })
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al generar PDF', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER MODAL */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="text-orange-500" size={20} /> Detalle de Costos
            </h2>
            <p className="text-xs text-gray-400">Orden #{order.id}</p>
          </div>
          <div className="flex gap-2">
            
            {/* BOTÓN COMPARTIR (El que usa Emi en el celu) */}
            <button 
              onClick={handleShare} 
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow disabled:opacity-50"
            >
              {isGenerating ? '...' : <><Share2 size={16} /> <span className="hidden sm:inline">PDF / Compartir</span></>}
            </button>

            <button onClick={onClose} className="text-gray-400 hover:text-white px-2 hover:bg-slate-800 rounded transition"><X size={20}/></button>
          </div>
        </div>

        {/* BODY (LISTA DE ITEMS PARA EDITAR) */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* ... LISTA DE ITEMS (Igual que antes) ... */}
          <div className="space-y-2 mb-6">
             {items.length === 0 ? <p className="text-gray-400 text-center py-4 italic">Sin items cargados.</p> : 
                items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.description}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{item.item_type} (x{item.quantity})</p>
                  </div>
                  <span className="font-bold text-gray-700">${(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
             ))}
          </div>

          <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
            <span className="text-slate-600 font-bold uppercase text-sm">Total</span>
            <span className="text-2xl font-bold text-green-600">$ {totalOrden.toLocaleString()}</span>
          </div>

          <form onSubmit={handleAdd} className="bg-orange-50 p-4 rounded-xl border border-orange-200">
             {/* ... FORMULARIO (Igual que antes) ... */}
             <input className="w-full mb-2 p-2 rounded border text-sm" placeholder="Descripción" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
             <div className="flex gap-2">
                <input className="w-full p-2 rounded border text-sm" type="number" placeholder="$ Precio" value={newItem.unit_price} onChange={e => setNewItem({...newItem, unit_price: e.target.value})} />
                <button disabled={loading} className="bg-orange-600 text-white px-4 rounded font-bold text-sm"><Plus/></button>
             </div>
          </form>
        </div>
      </div>

      {/* ================================================================================== */}
      {/* FACTURA FANTASMA (Hidden off-screen) - ESTO ES LO QUE SE IMPRIME EN EL PDF */}
      {/* ================================================================================== */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm', minHeight: '297mm', background: 'white' }}>
         <div ref={invoiceRef} className="p-10 text-slate-800 font-sans" style={{ width: '100%' }}>
            
            {/* CABECERA PDF */}
            <div className="flex justify-between border-b-4 border-orange-500 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase">{TALLER_INFO.nombre}</h1>
                    <p className="text-sm text-gray-500 mt-1">{TALLER_INFO.direccion}</p>
                    <p className="text-sm text-gray-500">{TALLER_INFO.telefono}</p>
                </div>
                <div className="text-right">
                    <div className="bg-orange-600 text-white px-3 py-1 font-bold rounded inline-block mb-1">PRESUPUESTO</div>
                    <p className="text-sm font-bold text-gray-600">#{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* DATOS CLIENTE PDF */}
            <div className="flex gap-8 mb-8">
                <div className="flex-1 bg-gray-50 p-4 rounded border-l-4 border-orange-500">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Cliente</h3>
                    <p className="font-bold text-lg capitalize">
                        {order.vehicles?.clients?.name} {order.vehicles?.clients?.lastname}
                        {!order.vehicles?.clients?.name && order.vehicles?.clients?.full_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Tel: {order.vehicles?.clients?.phone || '-'}</p>
                    <p className="text-sm text-gray-600">Email: {order.vehicles?.clients?.email || '-'}</p>
                    <p className="text-sm text-gray-600">CUIT: {order.vehicles?.clients?.cuil || '-'}</p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded border-l-4 border-gray-300">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Vehículo</h3>
                    <p className="font-bold text-lg">{order.vehicles?.brand} {order.vehicles?.model}</p>
                    <p className="text-sm text-gray-600 mt-1">Patente: <strong>{order.vehicles?.patent || order.vehicles?.plate}</strong></p>
                    <p className="text-sm text-gray-600">Año: {order.vehicles?.year || '-'}</p>
                </div>
            </div>

            {/* TABLA PDF */}
            <table className="w-full mb-8">
                <thead className="bg-slate-900 text-white text-xs uppercase">
                    <tr>
                        <th className="py-2 px-4 text-left">Descripción</th>
                        <th className="py-2 px-4 text-center">Cant.</th>
                        <th className="py-2 px-4 text-right">Precio</th>
                        <th className="py-2 px-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                            <td className="py-3 px-4">{item.description}</td>
                            <td className="py-3 px-4 text-center">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">${Number(item.unit_price).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-bold">${(item.unit_price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* TOTALES PDF */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-200 text-gray-500">
                        <span>Subtotal</span>
                        <span>${totalOrden.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 text-2xl font-black text-slate-900">
                        <span>TOTAL</span>
                        <span>${totalOrden.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-400">
                Documento no válido como factura fiscal.
            </div>
         </div>
      </div>

    </div>
  )
}