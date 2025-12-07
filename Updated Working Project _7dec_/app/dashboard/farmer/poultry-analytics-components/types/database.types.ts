// src/types/database.types.ts
// Auto-generated TypeScript types for Supabase tables

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            poultry_farms: {
                Row: {
                    id: string
                    name: string
                    location: string | null
                    capacity: number
                    owner: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    location?: string | null
                    capacity?: number
                    owner?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    location?: string | null
                    capacity?: number
                    owner?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            poultry_sheds: {
                Row: {
                    id: string
                    farm_id: string
                    name: string
                    capacity: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id: string
                    name: string
                    capacity?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string
                    name?: string
                    capacity?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            poultry_flocks: {
                Row: {
                    id: string
                    farm_id: string | null
                    shed_id: string | null
                    startDate: string
                    expectedSaleDate: string | null
                    count: number
                    breed: string | null
                    price: number | null
                    initialWeight: number | null
                    plannedDays: number | null
                    currentDay: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    farm_id?: string | null
                    shed_id?: string | null
                    startDate: string
                    expectedSaleDate?: string | null
                    count: number
                    breed?: string | null
                    price?: number | null
                    initialWeight?: number | null
                    plannedDays?: number | null
                    currentDay?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string | null
                    shed_id?: string | null
                    startDate?: string
                    expectedSaleDate?: string | null
                    count?: number
                    breed?: string | null
                    price?: number | null
                    initialWeight?: number | null
                    plannedDays?: number | null
                    currentDay?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            poultry_daily_logs: {
                Row: {
                    id: string
                    flock_id: string
                    day: number
                    date: string
                    openingBirds: number
                    birdsAlive: number
                    dead: number
                    culled: number
                    sold: number
                    cumulativeDead: number
                    bedding: string
                    beddingNote: string | null
                    feedType: string
                    feedGiven: number
                    feedLeftover: number
                    feedEaten: number
                    totalFeed: number
                    birdsWeighed: number
                    sampleWeight: number
                    avgWeight: number
                    medicineName: string | null
                    medicineDose: string | null
                    medicineMethod: string
                    medicineReason: string | null
                    withdrawalDate: string | null
                    feedBagsPurchased: number
                    feedBagsPrice: number
                    feedStockNotes: string | null
                    remarks: string | null
                    fcr: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    flock_id: string
                    day: number
                    date: string
                    openingBirds?: number
                    birdsAlive?: number
                    dead?: number
                    culled?: number
                    sold?: number
                    cumulativeDead?: number
                    bedding?: string
                    beddingNote?: string | null
                    feedType?: string
                    feedGiven?: number
                    feedLeftover?: number
                    feedEaten?: number
                    totalFeed?: number
                    birdsWeighed?: number
                    sampleWeight?: number
                    avgWeight?: number
                    medicineName?: string | null
                    medicineDose?: string | null
                    medicineMethod?: string
                    medicineReason?: string | null
                    withdrawalDate?: string | null
                    feedBagsPurchased?: number
                    feedBagsPrice?: number
                    feedStockNotes?: string | null
                    remarks?: string | null
                    fcr?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    flock_id?: string
                    day?: number
                    date?: string
                    openingBirds?: number
                    birdsAlive?: number
                    dead?: number
                    culled?: number
                    sold?: number
                    cumulativeDead?: number
                    bedding?: string
                    beddingNote?: string | null
                    feedType?: string
                    feedGiven?: number
                    feedLeftover?: number
                    feedEaten?: number
                    totalFeed?: number
                    birdsWeighed?: number
                    sampleWeight?: number
                    avgWeight?: number
                    medicineName?: string | null
                    medicineDose?: string | null
                    medicineMethod?: string
                    medicineReason?: string | null
                    withdrawalDate?: string | null
                    feedBagsPurchased?: number
                    feedBagsPrice?: number
                    feedStockNotes?: string | null
                    remarks?: string | null
                    fcr?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            feed_stock_logs: {
                Row: {
                    id: string
                    farm_id: string | null
                    company: string | null
                    starterName: string
                    growerName: string
                    finisherName: string
                    bagWeight: number
                    bagPrice: number
                    initialStock: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    farm_id?: string | null
                    company?: string | null
                    starterName?: string
                    growerName?: string
                    finisherName?: string
                    bagWeight?: number
                    bagPrice?: number
                    initialStock?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    farm_id?: string | null
                    company?: string | null
                    starterName?: string
                    growerName?: string
                    finisherName?: string
                    bagWeight?: number
                    bagPrice?: number
                    initialStock?: number
                    created_at?: string
                }
            }
            app_state: {
                Row: {
                    id: string
                    currency: string
                    mortalityThreshold: number
                    fcrTarget: number
                    defaultBagWeight: number
                    medicineReminders: boolean
                    weightUnit: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    currency?: string
                    mortalityThreshold?: number
                    fcrTarget?: number
                    defaultBagWeight?: number
                    medicineReminders?: boolean
                    weightUnit?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    currency?: string
                    mortalityThreshold?: number
                    fcrTarget?: number
                    defaultBagWeight?: number
                    medicineReminders?: boolean
                    weightUnit?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            marketplace_prices: {
                Row: {
                    id: string
                    date: string
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    date: string
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    date?: string
                    price?: number
                    created_at?: string
                }
            }
        }
        Views: {
            latest_flocks: {
                Row: {
                    id: string
                    farm_id: string | null
                    shed_id: string | null
                    startDate: string
                    expectedSaleDate: string | null
                    count: number
                    breed: string | null
                    price: number | null
                    initialWeight: number | null
                    plannedDays: number | null
                    currentDay: number | null
                    created_at: string
                }
            }
            daily_summary_stats: {
                Row: {
                    flock_id: string
                    day: number
                    date: string
                    birdsAlive: number
                    dead: number
                    cumulativeDead: number
                    feedEaten: number
                    totalFeed: number
                    avgWeight: number
                    fcr: number | null
                    daily_mortality_pct: number
                    cumulative_mortality_pct: number
                }
            }
        }
        Functions: {
            calculate_fcr: {
                Args: {
                    p_flock_id: string
                    p_day: number
                }
                Returns: number
            }
            get_current_feed_stock: {
                Args: {
                    p_farm_id: string
                }
                Returns: number
            }
            get_flock_performance: {
                Args: {
                    p_flock_id: string
                }
                Returns: {
                    total_days: number
                    current_birds: number
                    total_mortality: number
                    mortality_rate: number
                    avg_daily_mortality: number
                    current_avg_weight: number
                    total_feed_consumed: number
                    current_fcr: number
                }[]
            }
        }
    }
}
