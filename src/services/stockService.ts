import axios, { AxiosResponse } from "axios";
import mockRes from "../mocks/stockData.json";
import stockList from "../mocks/stocksList.json";
import { StockDataType, TickerResult, TickerResponse } from "../utils/types";
import { NODE_ENV } from "../utils/constants";

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;
const API_KEY = import.meta.env.VITE_API_KEY;
const ENV_MODE = process.env.NODE_ENV;

export const getStockData = async (
  stock: string,
  dateRange: { startDate: string; endDate: string }
): Promise<StockDataType> => {
  if (ENV_MODE === NODE_ENV.mock) {
    return mockRes;
  }
  try {
    const stockDataResponse: AxiosResponse<StockDataType> =
      await axios.get<StockDataType>(
        `${API_DOMAIN}/v2/aggs/ticker/${stock}/range/1/day/${dateRange.startDate}/${dateRange.endDate}?apiKey=${API_KEY}`
      );
    return stockDataResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchStockList = async (): Promise<TickerResult[]> => {
  if (ENV_MODE === NODE_ENV.mock) {
    return stockList.results;
  }
  try {
    const url = `${API_DOMAIN}/v3/reference/tickers?market=stocks&active=true&apiKey=${API_KEY}&limit=1000`;
    const tickerListResponse: AxiosResponse<TickerResponse> =
      await axios.get<TickerResponse>(url);
    return tickerListResponse.data.results;
  } catch (error) {
    throw error;
  }
};
