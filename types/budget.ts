
export interface BudgetCategory {
  id?: number;
  plan_id?: number;
  name: string;
  color: string;
  allocatedAmount?: number;
  bankName?: string;
}

export interface BudgetItem {
  id?: number;
  plan_id?: number;
  name: string;
  nominal: number;
  category: string;
  actualSpent?: number;
  bankName?: string;
}

export interface BudgetPlan {
  id?: number;
  user_id: number;
  month: string;
  income: number;
  items: BudgetItem[];
  categories: BudgetCategory[];
}
