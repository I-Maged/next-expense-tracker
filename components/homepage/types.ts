export type HeroSummaryTop = {
  name: string;
  total: number;
  color: string;
};

export type HeroSummary = {
  spent: number;
  income: number;
  top: Array<HeroSummaryTop>;
};
