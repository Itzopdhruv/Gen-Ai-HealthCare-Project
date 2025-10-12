import { NextRequest, NextResponse } from 'next/server'
import { medicines } from '@/lib/database'

interface AddStockRequest {
  medicineId: string
  quantity: number
  reason?: string
}

interface AddStockResponse {
  success: boolean
  data?: {
    medicine: any
    newStock: number
    message: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AddStockResponse>> {
  try {
    const body: AddStockRequest = await request.json()
    const { medicineId, quantity, reason = 'Manual stock addition' } = body

    if (!medicineId || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicine ID and quantity are required' 
      }, { status: 400 })
    }

    // Find the medicine
    const medicineIndex = medicines.findIndex(m => m.id === medicineId)
    if (medicineIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicine not found' 
      }, { status: 404 })
    }

    const medicine = medicines[medicineIndex]
    const oldStock = medicine.stock
    const newStock = oldStock + quantity

    // Update medicine stock
    medicines[medicineIndex] = {
      ...medicine,
      stock: newStock,
      updatedAt: new Date().toISOString(),
      lastRestocked: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: {
        medicine: medicines[medicineIndex],
        newStock,
        message: `Successfully added ${quantity} units to ${medicine.name}. Stock increased from ${oldStock} to ${newStock}.`
      }
    })

  } catch (error) {
    console.error('Add Stock Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add stock' 
    }, { status: 500 })
  }
}

// GET endpoint to list all medicines with their stock
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get('lowStock')
    const outOfStock = searchParams.get('outOfStock')

    let filteredMedicines = medicines

    if (lowStock === 'true') {
      filteredMedicines = medicines.filter(m => m.stock <= m.minStock && m.stock > 0)
    } else if (outOfStock === 'true') {
      filteredMedicines = medicines.filter(m => m.stock === 0)
    }

    const medicinesList = filteredMedicines.map(medicine => ({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      stock: medicine.stock,
      minStock: medicine.minStock,
      maxStock: medicine.maxStock,
      price: medicine.price,
      status: medicine.stock === 0 ? 'out_of_stock' : 
               medicine.stock <= medicine.minStock ? 'low_stock' : 'normal'
    }))

    return NextResponse.json({
      success: true,
      data: {
        medicines: medicinesList,
        totalMedicines: medicines.length,
        lowStockCount: medicines.filter(m => m.stock <= m.minStock && m.stock > 0).length,
        outOfStockCount: medicines.filter(m => m.stock === 0).length,
        normalStockCount: medicines.filter(m => m.stock > m.minStock).length
      }
    })

  } catch (error) {
    console.error('Get Medicines Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve medicines' 
    }, { status: 500 })
  }
}
