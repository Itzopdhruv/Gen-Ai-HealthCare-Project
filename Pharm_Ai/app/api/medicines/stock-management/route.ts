import { NextRequest, NextResponse } from 'next/server'
import { medicines, InventoryTransaction } from '@/lib/database'

interface StockUpdateRequest {
  medicineId: string
  quantity: number
  type: 'in' | 'out' | 'adjustment'
  reason: string
  reference?: string
  userId: string
  notes?: string
}

interface StockUpdateResponse {
  success: boolean
  data?: {
    medicine: any
    transaction: InventoryTransaction
    stockStatus: 'low' | 'normal' | 'out_of_stock'
    alert?: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<StockUpdateResponse>> {
  try {
    const body: StockUpdateRequest = await request.json()
    const { 
      medicineId,
      quantity,
      type,
      reason,
      reference,
      userId,
      notes
    } = body

    if (!medicineId || !quantity || !type || !reason || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
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

    // Update stock based on transaction type
    let newStock = oldStock
    switch (type) {
      case 'in':
        newStock = oldStock + quantity
        break
      case 'out':
        newStock = Math.max(0, oldStock - quantity)
        break
      case 'adjustment':
        newStock = quantity
        break
    }

    // Update medicine stock
    medicines[medicineIndex] = {
      ...medicine,
      stock: newStock,
      updatedAt: new Date().toISOString(),
      lastRestocked: type === 'in' ? new Date().toISOString() : medicine.lastRestocked
    }

    // Create inventory transaction
    const transaction: InventoryTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      medicineId,
      type,
      quantity,
      reason,
      reference,
      userId,
      timestamp: new Date().toISOString(),
      notes
    }

    // Determine stock status
    let stockStatus: 'low' | 'normal' | 'out_of_stock' = 'normal'
    let alert: string | undefined

    if (newStock === 0) {
      stockStatus = 'out_of_stock'
      alert = `URGENT: ${medicine.name} is now OUT OF STOCK! Immediate restocking required.`
    } else if (newStock <= medicine.minStock) {
      stockStatus = 'low'
      alert = `WARNING: ${medicine.name} stock is LOW (${newStock}/${medicine.minStock}). Consider restocking soon.`
    }

    return NextResponse.json({
      success: true,
      data: {
        medicine: medicines[medicineIndex],
        transaction,
        stockStatus,
        alert
      }
    })

  } catch (error) {
    console.error('Stock Update Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update stock' 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve stock information
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const medicineId = searchParams.get('medicineId')

    if (medicineId) {
      // Get specific medicine stock
      const medicine = medicines.find(m => m.id === medicineId)
      if (!medicine) {
        return NextResponse.json({ 
          success: false, 
          error: 'Medicine not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          medicine: {
            id: medicine.id,
            name: medicine.name,
            genericName: medicine.genericName,
            stock: medicine.stock,
            minStock: medicine.minStock,
            maxStock: medicine.maxStock,
            price: medicine.price,
            lastRestocked: medicine.lastRestocked
          },
          stockStatus: medicine.stock === 0 ? 'out_of_stock' : 
                       medicine.stock <= medicine.minStock ? 'low' : 'normal'
        }
      })
    } else {
      // Get all medicines with low/out of stock
      const lowStockMedicines = medicines.filter(m => m.stock <= m.minStock)
      const outOfStockMedicines = medicines.filter(m => m.stock === 0)

      return NextResponse.json({
        success: true,
        data: {
          lowStock: lowStockMedicines.map(m => ({
            id: m.id,
            name: m.name,
            genericName: m.genericName,
            stock: m.stock,
            minStock: m.minStock,
            price: m.price
          })),
          outOfStock: outOfStockMedicines.map(m => ({
            id: m.id,
            name: m.name,
            genericName: m.genericName,
            stock: m.stock,
            minStock: m.minStock,
            price: m.price
          })),
          totalMedicines: medicines.length,
          lowStockCount: lowStockMedicines.length,
          outOfStockCount: outOfStockMedicines.length
        }
      })
    }

  } catch (error) {
    console.error('Stock Retrieval Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve stock information' 
    }, { status: 500 })
  }
}
