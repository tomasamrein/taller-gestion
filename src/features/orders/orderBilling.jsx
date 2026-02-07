import { useEffect, useState, useRef } from 'react'
import { getOrderItems, addOrderItem } from '../../services/orderService'
import { Trash, Plus, Share2, Download, X, DollarSign, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function OrderBilling({ order, onClose }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ description: '', unit_price: '', quantity: 1, item_type: 'repuesto' })
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const invoiceRef = useRef(null)
  
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

  // --- GENERACIÓN DE PDF ---
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

  // --- OPCIÓN 1: COMPARTIR PDF (NATIVO MÓVIL) ---
  const handleShareWhatsApp = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generando PDF...')
    
    try {
      const pdf = await generatePDFBlob()
      const blob = pdf.output('blob')
      
      // Nombre del archivo personalizado con el apellido del cliente
      const clientName = order.vehicles?.clients?.lastname || 'Cliente'
      const fileName = `Presupuesto_${clientName}_${order.id}.pdf`
      
      const file = new File([blob], fileName, { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Esto abre el menú nativo del celular (Emi elige WhatsApp y el contacto)
        await navigator.share({
          files: [file],
          title: `Presupuesto Taller - Orden #${order.id}`,
          text: `Hola ${order.vehicles?.clients?.name || ''}, acá te adjunto el presupuesto.`
        })
        toast.success('¡Listo! Elegí WhatsApp', { id: toastId })
      } else {
        // Si está en PC y no puede compartir, se lo descargamos
        pdf.save(fileName)
        toast.success('Descargado (Tu PC no soporta envío directo)', { id: toastId })
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al generar', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  // --- OPCIÓN 2: DESCARGAR (PARA PC) ---
  const handleDownload = async () => {
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

  // --- OPCIÓN 3: ABRIR CHAT (SOLO TEXTO) ---
  const handleOpenChat = () => {
      const phone = order.vehicles?.clients?.phone
      if (!phone) return toast.error('El cliente no tiene teléfono')
      
      // Limpiamos el número para WhatsApp
      let num = phone.replace(/\D/g, '')
      if (num.startsWith('0')) num = num.substring(1)
      if (!num.startsWith('54')) num = '549' + num

      const text = `Hola ${order.vehicles?.clients?.name || ''}, te escribo por el presupuesto del ${order.vehicles?.model}.`
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER MODAL CON BOTONERA POWER */}
        <div className="bg-slate-900 text-white p-3 flex flex-col gap-3 border-b-4 border-orange-500">
          <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="text-orange-500" size={20} /> Costos
                </h2>
                <p className="text-xs text-gray-400">Orden #{order.id}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white px-2 rounded"><X size={24}/></button>
          </div>

          {/* BOTONERA DE ACCIONES */}
          <div className="flex gap-2">
            
            {/* 1. ENVIAR PDF (La estrella) */}
            <button 
              onClick={handleShareWhatsApp} 
              disabled={isGenerating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
            >
              {isGenerating ? '...' : <><Share2 size={16} /> Enviar PDF</>}
            </button>

            {/* 2. SOLO CHAT */}
            <button 
              onClick={handleOpenChat}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition"
              title="Abrir Chat de WhatsApp"
            >
              <MessageCircle size={16} />
            </button>

            {/* 3. DESCARGAR */}
            <button 
              onClick={handleDownload}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition"
              title="Descargar en el dispositivo"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 flex-1 overflow-y-auto">
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
             <input className="w-full mb-2 p-2 rounded border text-sm" placeholder="Descripción" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
             <div className="flex gap-2">
                <input className="w-full p-2 rounded border text-sm" type="number" placeholder="$ Precio" value={newItem.unit_price} onChange={e => setNewItem({...newItem, unit_price: e.target.value})} />
                <button disabled={loading} className="bg-orange-600 text-white px-4 rounded font-bold text-sm"><Plus/></button>
             </div>
          </form>
        </div>
      </div>

      {/* ================================================================================== */}
      {/* FACTURA FANTASMA (Tus estilos corregidos) */}
      {/* ================================================================================== */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm', minHeight: '297mm', background: 'white' }}>
         <div ref={invoiceRef} className="p-12 text-slate-800 font-sans" style={{ width: '100%' }}>
            
            <div className="flex justify-between border-b-4 border-orange-500 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">{TALLER_INFO.nombre}</h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{TALLER_INFO.direccion}</p>
                    <p className="text-sm text-gray-500">{TALLER_INFO.telefono}</p>
                </div>
                <div className="text-right">
                    <div className="bg-orange-600 text-white px-6 py-2 font-bold rounded-lg inline-block mb-2 text-sm tracking-wide">
                        PRESUPUESTO
                    </div>
                    <p className="text-lg font-bold text-gray-700">Orden #{order.id}</p>
                    <p className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex gap-10 mb-10">
                <div className="flex-1 bg-gray-50 p-6 rounded-lg border-l-8 border-orange-500">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Cliente</h3>
                    <p className="font-bold text-xl capitalize text-slate-900 mb-2">
                        {order.vehicles?.clients?.name} {order.vehicles?.clients?.lastname}
                        {!order.vehicles?.clients?.name && order.vehicles?.clients?.full_name}
                    </p>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600"><strong>Tel:</strong> {order.vehicles?.clients?.phone || '-'}</p>
                        <p className="text-sm text-gray-600"><strong>Email:</strong> {order.vehicles?.clients?.email || '-'}</p>
                        <p className="text-sm text-gray-600"><strong>CUIT:</strong> {order.vehicles?.clients?.cuil || '-'}</p>
                    </div>
                </div>
                <div className="flex-1 bg-gray-50 p-6 rounded-lg border-l-8 border-gray-300">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Vehículo</h3>
                    <p className="font-bold text-xl text-slate-900 mb-2">{order.vehicles?.brand} {order.vehicles?.model}</p>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">Patente: <strong>{order.vehicles?.patent || order.vehicles?.plate}</strong></p>
                        <p className="text-sm text-gray-600">Año: {order.vehicles?.year || '-'}</p>
                    </div>
                </div>
            </div>

            <table className="w-full mb-10">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <tr>
                        <th className="py-4 px-6 text-left">Descripción</th>
                        <th className="py-4 px-6 text-center">Cant.</th>
                        <th className="py-4 px-6 text-right">Precio Unit.</th>
                        <th className="py-4 px-6 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                            <td className="py-4 px-6 font-medium">{item.description}</td>
                            <td className="py-4 px-6 text-center">{item.quantity}</td>
                            <td className="py-4 px-6 text-right">${Number(item.unit_price).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right font-bold text-slate-900">${(item.unit_price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-72">
                    <div className="flex justify-between py-3 border-b border-gray-200 text-gray-500 font-medium">
                        <span>Subtotal</span>
                        <span>${totalOrden.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-4 text-3xl font-black text-slate-900 items-end">
                        <span className="text-lg font-bold text-gray-400 mb-1">TOTAL</span>
                        <span>${totalOrden.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-orange-500 mt-2 w-full"></div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">Gracias por confiar en {TALLER_INFO.nombre}</p>
                <p className="text-[10px] text-gray-300">Documento no válido como factura fiscal.</p>
            </div>
         </div>
      </div>
    </div>
  )
}