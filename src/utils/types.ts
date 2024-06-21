export type Result = {
  v: number;
  vw: number;
  o: number;
  c: number;
  h: number;
  l: number;
  t: number;
  n: number;
};

export type StockDataType = {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: Result[];
};

export type TickerResult = {
  ticker: string;
  name?: string;
  market?: string;
  locale?: string;
  primary_exchange?: string;
  type?: string;
  active?: boolean;
  currency_name?: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  last_updated_utc?: string;
};

// Define the type for the entire response
export type TickerResponse = {
  results: TickerResult[];
  status: string;
  request_id: string;
  count: number;
  next_url: string;
};

export type KeyValue = {
  [key: string]: any;
};

export type ChartDataSet = {
  label: string;
  data: Number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};
