import { useEffect, useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { BookingProperty } from "../booking/booking-card"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "../booking/date-range-calendar"
import { PropertyNamePriceEdit } from "./property-name-price-edit"
import { Console } from "console"
import { PropertyDescription } from "./property-description"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden"
const MAIN_IMAGE_WRAPPER_STYLES = "relative w-full overflow-hidden rounded-xl md:rounded-3xl h-[60vh] md:h-auto md:aspect-[16/5]"
const THUMBNAIL_STYLES = "relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-xl border-[2px] border-foreground/70 bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer group"
const THUMBNAIL_LABEL_STYLES = "absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 font-mono text-[8px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"
const PRICE_TEXT_STYLES = "font-mono font-bold text-primary text-lg md:text-xl"
const SUMMARY_CARD_STYLES = "flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30"

interface BookingDetailsProps {
    property: BookingProperty
    onBack: () => void
    isExiting?: boolean
    checkInDate?: Date | null
    checkOutDate?: Date | null
}

/**
 * Fields que o Owner pode editar
 */
export interface EditableFieldsI extends Pick<BookingProperty, "title" | "description" | "location" | "price" | "imageUrl">
    {/*sem campos extra*/}


/**
 *  * Estados
 * @property property: BookingProperty // estado atual
 * @property propertySaved: BookingProperty // estado salvado
 * @property editField : <EditableFieldsI | null> // field a ser editado
 *  * Funções de update
 * @property updateProperty: <K extends keyof BookingProperty>(key: K, value: BookingProperty[K]) => void
 * // atualiza o estado atual
 * @property savePropertyData: <K extends keyof BookingProperty>(key: K, value: BookingProperty[K]) void 
 * // salva um field do estado
 * @property savePropertyDataAll: () => void // salva o estado
 * @property revertToSavedData: () => void //volta para o estado salvado
 * @property cancelFieldEdit: (field: EditableFieldsI) => void //remove as alterações a um field
 * * Edição de Campo
 * @property setEditField:(field: EditableFieldsI | null) => void // define o field a ser editado
 */
export interface PropertyEditContext {
    // Estados
    property: BookingProperty;
    propertySaved: BookingProperty;
    editField: keyof EditableFieldsI | null;
    
    // Funções de update
    updateProperty: <K extends keyof EditableFieldsI>(field: K, value: EditableFieldsI[K]) => void; //atualiza o estado atual 
    savePropertyData: <K extends keyof EditableFieldsI>(field: K, value: EditableFieldsI[K]) => void;  // salva um dos dados
    savePropertyDataAll: () => void; // salva TODOS os dados
    revertToSavedData: () => void; // restaura TODOS os dados
    revertFields: (fieldSet: (keyof EditableFieldsI)[]) => void; // restaura dados dos fields no Set
    cancelFieldEdit: (field: keyof EditableFieldsI) => void; // restaura os dados de um field

    // Edição de campo
    setEditField: (field: keyof EditableFieldsI | null) => void;
    
}



// TODO: recolher user do BD
const currentUser = {
  name: "Admin User",
  email: "admin@nexus-estates.com",
  avatar: "/avatars/shadcn.jpg",
  role: "OWNER" as UserRole,
}
type UserRole = "GUEST" | "OWNER"


/**
 * Componete para editar a indformação sobre uma propriedade
 * @param param0 
 * @returns 
 */
export function PropertyEdit({ property : initialProperty, onBack, isExiting, checkInDate = null, checkOutDate = null }: BookingDetailsProps) {
    const handleBack = useCallback(() => {
        onBack()
    }, [onBack])

    // Custom hook handles gestures (swipe/wheel)
    useSwipeBack(handleBack)

    const [property, setProperty] = useState<BookingProperty>(initialProperty);
    const [propertySaved, setpropertySaved] = useState<BookingProperty>(initialProperty);

    function updateProperty<K extends keyof EditableFieldsI>(key: K, value: EditableFieldsI[K]){
        setProperty(prevData => ({...prevData, [key]:value}))
    }

    const [editField, setEditField] = useState<keyof EditableFieldsI | null>(null)

    // contexto a ser enviado ás componetes filhos
    const editContext : PropertyEditContext ={
        property: property,
        propertySaved : propertySaved,
        updateProperty(key, value){
            setProperty(prevData => ({...prevData, [key]:value}))
        },
        savePropertyDataAll(){
            setpropertySaved(property)
        },
        savePropertyData(key, value){
            setpropertySaved(prevData => ({...prevData, [key]:value}))
        },
        revertToSavedData(){
            setProperty(propertySaved)
        },
        revertFields(fields) {
            setProperty((prevData): BookingProperty => {
                return {
                    ...prevData,
                    ...Object.fromEntries(
                        fields.map(field => [field, propertySaved[field ?? '']]) as any
                    )
                };
            });
        },
        editField : editField,
        setEditField : setEditField,
        cancelFieldEdit(field) {
            setProperty(prevData => ({...prevData, [field]: propertySaved[field]}))
        }
    }


    return (
        <div className={cn(
            PAGE_CONTAINER_STYLES,
            isExiting ? "animate-fly-out-right" : "animate-fly-in"
        )}>
            <div className="mb-4">
                <Button 
                    onClick={handleBack}
                    variant="brutal-outline" 
                    className="group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span className="flex items-center gap-1">
                        <span className="opacity-70">&lt;</span>
                        <span>Back to listings</span>
                    </span>
                </Button>
            </div>

            <div className="space-y-6">

                <PropertyGallery property={property}  />

                <div className="space-y-6">
                    <PropertyNamePriceEdit context={editContext}/>

                    <PropertyDescription context={editContext}/>

                        <BrutalShard id="amenities">
                            <div className="space-y-4">
                                <h3 className="font-mono text-xl font-black uppercase border-l-4 border-primary pl-3">Amenities</h3>
                                <div className="flex flex-wrap gap-3">
                                    {property.tags?.map((tag) => (
                                        <Badge key={tag} variant="amenity">
                                            <Check className="h-3 w-3" />
                                            {tag}
                                        </Badge>
                                    ))}

                                        <Badge variant="amenity"> + </Badge>

                                </div>
                            </div>

                            <div className="mt-8">
                                <Button variant="brutal" className="w-full h-14 md:h-16 text-lg md:text-xl font-black uppercase tracking-wider shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)]">
                                    Book Now
                                </Button>
                            </div>
                        </BrutalShard>

                        <BrutalShard id="newCard" className="text-center">
                                    <span className="font-mono font-bold uppercase text-xs md:text-sm"> CREATE NEW CARD </span>
                        </BrutalShard>
                    
                </div>
            </div>
        </div>
    )
}

// --- Sub-components & Hooks ---

function PropertyGallery({ property }: { property: BookingProperty }) {
    const galleryImages = [
        property.imageUrl,
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        if (galleryImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
        }, 6000)
        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    return (
        <div>
            <div className={MAIN_IMAGE_WRAPPER_STYLES}>
                <img 
                    src={galleryImages[activeImageIndex]} 
                    alt={property.title} 
                    className="h-full w-full object-cover"
                />
                <Badge variant="featured" className="absolute top-4 left-4">FEATURED</Badge>
            </div>
  
           <div className="grid grid-flow-col grid-cols-4 my-3 gap-4 ">
                <div id ="images" className={`grid gap-4 pb-2 grid-flow-col auto-cols-[33%] overflow-x-scroll col-span-3 snap-x`}>
                    {galleryImages.map((imageSrc, index) => (
                        
                        <div
                            key={`${imageSrc}-${index}`}
                            
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(THUMBNAIL_STYLES,"group snap-center")}
                        >
                            <img src={imageSrc} alt="" className="h-full w-full object-cover" />

                                <Button variant="brutal" className="absolute top-4 left-4">DELETE</Button>

                            <div className={THUMBNAIL_LABEL_STYLES}>VIEW</div>
                        </div>
                    ))}
                </div>

                    <button
                        key={"Add Image"}
                        type="button"
                        className={cn(THUMBNAIL_STYLES, "max-w-fit h-full flex items-center justify-center")}
                    >
                        <h1 className="text-6xl sm:text-8xl self-center"> + </h1>
                    </button>

            </div>

        </div>
    )
}

function useSwipeBack(onBack: () => void) {
    useEffect(() => {
        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            if (isHorizontal && e.deltaX < -20) {
                onBack()
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY

            if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                onBack()
            }
        }

        window.addEventListener("wheel", handleWheel)
        window.addEventListener("touchstart", handleTouchStart)
        window.addEventListener("touchend", handleTouchEnd)
        
        return () => {
            window.removeEventListener("wheel", handleWheel)
            window.removeEventListener("touchstart", handleTouchStart)
            window.removeEventListener("touchend", handleTouchEnd)
        }
    }, [onBack])
}
