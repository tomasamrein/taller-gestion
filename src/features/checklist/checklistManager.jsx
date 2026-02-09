import { useEffect, useState, useRef } from 'react'
import { getChecklistByOrderId, saveChecklist } from '../../services/checklistService'
import { addOrderItem } from '../../services/orderService'
import { CHECKLIST_CATEGORIES, STATUS_OPTIONS } from '../../config/checklistConfig'
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, Slash, Plus, Share2, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ChecklistManager({ orderId, order, onClose }) { 
  const [checklistData, setChecklistData] = useState({})
  const [extraData, setExtraData] = useState({})
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('entrada') 
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const autoSaveTimerRef = useRef(null)
  const reportRef = useRef(null)

  // --- DATOS DEL TALLER COMPLETOS ---
  const TALLER_INFO = {
    nombre: "SERVICIO MECÁNICO Y AUXILIO",
    razon_social: "Emiliano Salomón",
    cuit: "20-39456427-4", // <--- NUEVO
    direccion: "Chaco 5785, Santa Fe",
    telefono: "342-530-3133",
    email: "emilianosalomon@email.com",
    logo_color: "#ea580c"
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data = await getChecklistByOrderId(orderId)
      if (data && data.values) {
        setChecklistData(data.values.status || {})
        setExtraData(data.values.extras || {})
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return
    setSaveStatus('unsaved')
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveChecklist({
          order_id: orderId,
          values: { status: checklistData, extras: extraData }
        })
        setSaveStatus('saved')
      } catch (error) {
        setSaveStatus('error')
      }
    }, 1500)
    return () => clearTimeout(autoSaveTimerRef.current)
  }, [checklistData, extraData])

  // --- PDF GENERATOR ---
  const generatePDFBlob = async () => {
    if (!reportRef.current) return null
    
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (doc) => {
            const el = doc.getElementById('report-content');
            if (el) el.style.display = 'block';
        }
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const finalHeight = imgHeight > pageHeight ? imgHeight : pageHeight;
    
    const pdf = new jsPDF('p', 'mm', [imgWidth, finalHeight]);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    return pdf
  }

  const getFileName = () => `Informe_${mode.toUpperCase()}_Orden_${orderId}.pdf`

  const handleShare = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generando...')
    try {
        const pdf = await generatePDFBlob()
        const blob = pdf.output('blob')
        const file = new File([blob], getFileName(), { type: 'application/pdf' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Informe Técnico - Orden #${orderId}`,
                text: `Adjunto informe técnico (${mode}).`
            })
            toast.success('Abriendo compartir...', { id: toastId })
        } else {
            pdf.save(getFileName())
            toast.success('Descargado', { id: toastId })
        }
    } catch (error) {
        console.error(error)
        toast.error('Error al generar', { id: toastId })
    } finally {
        setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Descargando...')
    try {
        const pdf = await generatePDFBlob()
        pdf.save(getFileName())
        toast.success('Listo', { id: toastId })
    } catch (error) {
        console.error(error)
        toast.error('Error', { id: toastId })
    } finally {
        setIsGenerating(false)
    }
  }

  // --- ACTIONS ---
  const updateStatus = (itemName, statusValue) => {
    const key = `${itemName}_${mode}`
    setChecklistData(prev => ({ ...prev, [key]: statusValue }))
  }
  const updateExtra = (itemName, value) => {
    const key = `${itemName}_${mode}`
    setExtraData(prev => ({ ...prev, [key]: value }))
  }
  const markCategoryOK = (items) => {
    const updates = {}
    items.forEach(item => {
      const key = `${item.name}_${mode}`
      if (!checklistData[key]) updates[key] = 'ok'
    })
    setChecklistData(prev => ({ ...prev, ...updates }))
    toast.success('Categoría completada')
  }
  const addToBudget = async (itemName) => {
    const priceInput = window.prompt(`Precio estimado para: ${itemName}`, "0")
    if (priceInput === null) return 
    const toastId = toast.loading('Agregando...')
    try {
        await addOrderItem({
            order_id: orderId,
            description: `Reparación: ${itemName}`,
            unit_price: Number(priceInput) || 0,
            quantity: 1,
            item_type: 'repuesto'
        })
        toast.success(`Agregado`, { id: toastId })
    } catch (error) {
        toast.error('Error', { id: toastId })
    }
  }

  // --- UI RENDER ---
  const renderSpecialInput = (item) => {
    const key = `${item.name}_${mode}`
    const value = extraData[key] || ''
    const baseClass = "w-full border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-colors bg-white"

    if (item.inputType === 'number') {
        return (
            <div className="mt-2 relative w-full max-w-[150px]">
                <input type="number" placeholder="0" value={value} onChange={(e) => updateExtra(item.name, e.target.value)} className={`${baseClass} pl-3 pr-10 py-1.5`}/>
                <span className="absolute right-3 top-1.5 text-xs text-gray-400 font-bold pointer-events-none">{item.unit}</span>
            </div>
        )
    }
    if (item.inputType === 'text') {
        return <textarea placeholder={item.placeholder} value={value} onChange={(e) => updateExtra(item.name, e.target.value)} className={`${baseClass} mt-2 p-2 h-16 resize-none`}/>
    }
    if (item.inputType === 'level') {
        return (
            <div className="mt-2 flex gap-1 bg-gray-50 p-1 rounded-lg border w-fit">
                {['Bajo', 'Medio', 'Alto'].map((lvl) => (
                    <button key={lvl} onClick={() => updateExtra(item.name, lvl)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm ${value === lvl ? (lvl === 'Bajo' ? 'bg-red-500 text-white' : lvl === 'Medio' ? 'bg-yellow-400 text-slate-900' : 'bg-green-500 text-white') : 'bg-white text-gray-400 hover:bg-gray-100'}`}>{lvl}</button>
                ))}
            </div>
        )
    }
    return null
  }

  const renderStatusButtons = (item) => {
    const key = `${item.name}_${mode}`
    const currentStatus = checklistData[key]
    return (
        <div className="flex gap-1">
            {Object.keys(STATUS_OPTIONS).map(optKey => {
                const option = STATUS_OPTIONS[optKey]
                const isSelected = currentStatus === option.value
                let icon = null
                if (optKey === 'OK') icon = <CheckCircle size={16} />
                if (optKey === 'ATTENTION') icon = <AlertTriangle size={16} />
                if (optKey === 'BAD') icon = <XCircle size={16} />
                if (optKey === 'NA') icon = <Slash size={14} />
                return (
                    <button key={optKey} onClick={() => updateStatus(item.name, option.value)} className={`flex-1 py-2 rounded-md flex justify-center items-center transition-all ${isSelected ? `${option.color} text-white shadow-sm font-bold scale-105` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{icon}</button>
                )
            })}
        </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      
      {/* HEADER APP */}
      <div className="bg-slate-900 text-white p-3 shadow-md z-10 shrink-0">
        <div className="flex justify-between items-center mb-3">
            <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                   📋 Chequeo
                   {saveStatus === 'saving' && <span className="text-xs font-normal text-orange-400 animate-pulse">Guardando...</span>}
                   {saveStatus === 'saved' && <span className="text-xs font-normal text-green-400">Guardado</span>}
                </h2>
                <p className="text-xs text-gray-400">Orden #{orderId}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={handleShare} disabled={isGenerating} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50">
                    {isGenerating ? '...' : <><Share2 size={16}/> <span className="hidden sm:inline">Enviar</span></>}
                </button>
                <button onClick={handleDownload} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50">
                    <Download size={16}/>
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white bg-slate-800 p-2 rounded-full ml-1">✕</button>
            </div>
        </div>
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
            <button onClick={() => setMode('entrada')} className={`flex-1 py-1.5 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition ${mode === 'entrada' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>📥 Ingreso</button>
            <button onClick={() => setMode('salida')} className={`flex-1 py-1.5 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition ${mode === 'salida' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>📤 Egreso</button>
        </div>
      </div>

      {/* BODY (UI) */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-3 pb-20">
        {loading ? <div className="text-center p-10 text-gray-400">Cargando chequeo...</div> : 
         CHECKLIST_CATEGORIES.map(cat => {
            const isOpen = expandedCategory === cat.id
            const totalItems = cat.items.length
            const filledItems = cat.items.filter(i => checklistData[`${i.name}_${mode}`]).length
            const percentage = Math.round((filledItems/totalItems)*100)
            
            return (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button onClick={() => setExpandedCategory(isOpen ? null : cat.id)} className={`w-full p-4 flex justify-between items-center transition ${isOpen ? 'bg-blue-50/50' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 w-full overflow-hidden">
                        <span className="text-xl shrink-0">{cat.title.split(' ')[0]}</span>
                        <div className="text-left flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{cat.title.substring(2)}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]"><div className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${percentage}%` }}></div></div>
                                <span className="text-[10px] text-gray-400 font-medium">{filledItems}/{totalItems}</span>
                            </div>
                        </div>
                    </div>
                    {isOpen ? <ChevronUp size={20} className="text-gray-400 shrink-0"/> : <ChevronDown size={20} className="text-gray-400 shrink-0"/>}
                </button>

                {isOpen && (
                    <div className="p-3 border-t border-gray-100 animate-fade-in bg-white">
                        <div className="flex justify-end mb-3">
                            <button onClick={() => markCategoryOK(cat.items)} className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition flex items-center gap-1 border border-green-100"><CheckCircle size={12}/> Marcar todo OK</button>
                        </div>
                        <div className="space-y-5">
                            {cat.items.map(item => {
                                const isBad = checklistData[`${item.name}_${mode}`] === 'bad'
                                return (
                                <div key={item.name} className="">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <p className="text-sm font-bold text-gray-700">{item.name}</p>
                                        {isBad && (<button onClick={() => addToBudget(item.name)} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1 font-bold animate-pulse"><Plus size={10} /> Presupuestar</button>)}
                                    </div>
                                    {renderStatusButtons(item)}
                                    {renderSpecialInput(item)}
                                </div>
                            )})}
                        </div>
                    </div>
                )}
              </div>
            )
        })}
      </div>

      {/* --- INFORME FANTASMA (PDF) --- */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm', minHeight: 'auto', background: 'white' }}>
         <div ref={reportRef} id="report-content" className="p-10 font-sans text-slate-800" style={{ width: '100%', minHeight: '297mm', background: 'white' }}>
            
            {/* CABECERA */}
            <div className="border-b-4 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1 leading-normal">{TALLER_INFO.nombre}</h1>
                    <p className="text-sm font-bold text-gray-700">{TALLER_INFO.razon_social}</p>
                    {/* CUIT AGREGADO AQUI */}
                    <p className="text-sm text-gray-500">CUIL: {TALLER_INFO.cuit}</p>
                    <p className="text-sm text-gray-500">{TALLER_INFO.direccion}</p>
                    <p className="text-sm text-gray-500">{TALLER_INFO.telefono}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="bg-slate-800 text-white px-4 py-1.5 font-bold rounded mb-1 text-sm tracking-wide">INFORME TÉCNICO</div>
                    <p className="font-bold text-lg text-slate-700">Orden #{orderId}</p>
                    <p className="text-xs text-gray-400 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* DATOS CLIENTE */}
            {order && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6 flex gap-6 text-sm border border-gray-200">
                <div className="flex-1">
                    <p className="font-bold uppercase text-gray-400 text-[10px] mb-1">Cliente</p>
                    <p className="font-bold text-base text-slate-900 leading-snug">{order.vehicles?.clients?.full_name || 'Cliente'}</p>
                </div>
                <div className="flex-1">
                    <p className="font-bold uppercase text-gray-400 text-[10px] mb-1">Vehículo</p>
                    <p className="font-bold text-base text-slate-900 leading-snug">{order.vehicles?.brand} {order.vehicles?.model}</p>
                    <p className="text-xs text-slate-500 mt-1">Patente: {order.vehicles?.patent}</p>
                </div>
                <div className="flex-1 text-right">
                     <p className="font-bold uppercase text-gray-400 text-[10px] mb-1">Revisión</p>
                     <p className={`font-black text-xl uppercase ${mode === 'entrada' ? 'text-orange-600' : 'text-green-600'}`}>{mode}</p>
                </div>
            </div>
            )}

            {/* GRILLA PDF */}
            <div className="flex flex-wrap -mx-4">
                {CHECKLIST_CATEGORIES.map(cat => (
                    <div key={cat.id} className="w-1/2 px-4 mb-6 break-inside-avoid">
                        <div className="border-b-2 border-slate-200 pb-1 mb-2 flex items-center gap-2">
                            <span className="text-xl flex items-center">{cat.title.split(' ')[0]}</span>
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider mt-1">{cat.title.substring(2)}</h3>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            {cat.items.map(item => {
                                const key = `${item.name}_${mode}`
                                const status = checklistData[key]
                                const extra = extraData[key]
                                
                                if (!status && !extra) return null

                                let statusColor = 'text-gray-300'
                                let statusIcon = '•'
                                if (status === 'ok') { statusColor = 'text-green-600'; statusIcon = '✓' }
                                if (status === 'attention') { statusColor = 'text-yellow-600'; statusIcon = '⚠' }
                                if (status === 'bad') { statusColor = 'text-red-600'; statusIcon = '✕' }

                                return (
                                    <div key={item.name} className="flex items-center justify-between border-b border-gray-100 py-1 min-h-[28px]">
                                        
                                        {/* NOMBRE */}
                                        <div className="w-[60%] pr-1 flex items-center">
                                            <span className="text-[10px] text-gray-700 font-medium leading-tight block">
                                                {item.name}
                                            </span>
                                        </div>
                                        
                                        {/* CAJA DE DATOS CON FIX DE ALINEACIÓN */}
                                        <div className="w-[40%] flex justify-end items-center gap-2">
                                            {extra && (
                                                <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded px-2 h-5 w-fit">
                                                    {/* Margen negativo para empujar el texto hacia arriba y compensar PDF */}
                                                    <span className="text-[9px] font-bold text-slate-600 text-center block mb-[2px]">
                                                        {extra} {item.unit}
                                                    </span>
                                                </div>
                                            )}
                                            <span className={`font-black ${statusColor} text-base w-5 text-center shrink-0 leading-none`}>
                                                {statusIcon}
                                            </span>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
                Este informe detalla el estado verificado del vehículo al momento de la revisión. {TALLER_INFO.nombre} - {TALLER_INFO.direccion}
            </div>
         </div>
      </div>
    </div>
  )
}