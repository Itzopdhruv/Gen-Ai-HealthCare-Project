// Vector Search Service - Disabled for deployment compatibility
// FAISS native bindings don't work well with Next.js builds

export interface MedicineEmbedding {
  id: string
  name: string
  dosage: string
  category: string
  embedding: number[]
  activeIngredients?: string[]
  therapeuticClass?: string
}

export interface SemanticSearchResult {
  medicine: MedicineEmbedding
  similarity: number
  reason: string
  therapeuticMatch: boolean
  ingredientMatch: boolean
}

export class VectorSearchService {
  private isInitialized = false

  constructor() {
    // FAISS disabled for deployment compatibility
  }

  static async getInstance(medicines?: any[]): Promise<VectorSearchService> {
    const service = new VectorSearchService()
    service.isInitialized = true
    return service
  }

  async findSimilarMedicines(queryMedicine: string, category?: string, maxResults: number = 5): Promise<SemanticSearchResult[]> {
    // FAISS disabled for deployment compatibility - return empty results
    return []
  }

  async searchMedicines(query: string, maxResults: number = 10): Promise<SemanticSearchResult[]> {
    // FAISS disabled for deployment compatibility - return empty results
    return []
  }

  async initialize(medicines: any[]): Promise<void> {
    // FAISS disabled for deployment compatibility
    this.isInitialized = true
  }
}
