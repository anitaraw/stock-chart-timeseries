import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  getStockData as fetchStockData,
  fetchStockList,
} from "../services/stockService";

import {
  getCurrentDate,
  getDate30DaysEarlier,
  dateStringToUnix,
  stringToColor,
  getErrorMessage,
} from "../utils/helpers";
import { priceTypeList, chartOptions } from "../utils/config";
import { TickerResult, Result, KeyValue, ChartDataSet } from "../utils/types";
import { CONSTANTS } from "../utils/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockChart = () => {
  const referenceData = useRef<KeyValue>({});
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ChartDataSet[];
  }>({ labels: [], datasets: [] });
  const [priceType, setPriceType] = useState("c");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: getDate30DaysEarlier(),
    endDate: getCurrentDate(),
  });
  const [stockList, setStockList] = useState<TickerResult[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<TickerResult[]>(
    []
  );

  const getStockList = async () => {
    try {
      const stocks = await fetchStockList();
      setStockList(stocks);
      setFilteredStockList(stocks);
    } catch (error: any) {
      alert(getErrorMessage(error));
    }
  };

  /**Initial Stock List API all for fetching list */
  useEffect(() => {
    getStockList();
  }, []);

  useEffect(() => {
    handleInputParamChange();
  }, [selectedStocks, dateRange.startDate, dateRange.endDate]);

  /**Filter stock data based on priceType selected */
  const filterStockData = (stockData: KeyValue[], type = priceType) => {
    return stockData?.map((entry: KeyValue) => entry?.[type]);
  };

  const fetchStockDataFromApi = async (stock: string) => {
    const stockData = await fetchStockData(stock, dateRange);
    return {
      chartData: {
        label: stock,
        data: filterStockData(stockData?.results),
        backgroundColor: stringToColor(stock),
        tension: 0.1,
      },
      results: stockData?.results,
    };
  };

  /**Handle showChart button click */
  const handleInputParamChange = async () => {
    try {
      if (!selectedStocks?.length || !priceType) {
        return;
      } else {
        let datasets: ChartDataSet[] = [];
        /**Init the referenceData to store the initial dateRange */
        if (!referenceData.current?.startDate) {
          referenceData.current = {
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
            priceType, //against which the reference data would be created
          };
        }

        /**If both startDate and endDate are present then proceed further */
        if (
          referenceData.current?.startDate &&
          referenceData.current?.endDate
        ) {
          /**If startDate and endDate are different, then clear reference data for the previously stored values */
          if (
            dateStringToUnix(referenceData.current?.startDate) !==
              dateStringToUnix(dateRange?.startDate) ||
            dateStringToUnix(referenceData.current?.endDate) !==
              dateStringToUnix(dateRange?.endDate)
          ) {
            referenceData.current = {};
            referenceData.current = { ...dateRange };
          }

          await Promise.all(
            selectedStocks.map(async (stock) => {
              if (referenceData.current[stock]) {
                if (referenceData.current?.priceType !== priceType) {
                  const updatedChartData = filterStockData(
                    referenceData.current[stock]?.results
                  );
                  referenceData.current[stock] = {
                    ...referenceData.current[stock],
                    priceType,
                    dataset: {
                      ...referenceData.current[stock]?.dataset,
                      data: updatedChartData,
                    },
                  };
                }

                datasets.push(referenceData.current[stock]?.dataset);
              } else {
                const stockData = await fetchStockDataFromApi(stock);

                referenceData.current[stock] = {
                  ...referenceData.current[stock],
                  results: stockData?.results,
                  dataset: stockData?.chartData,
                };
                datasets.push(stockData?.chartData);
              }
            })
          );

          const labels =
            referenceData.current?.[selectedStocks[0]]?.results?.map(
              (entry: Result) => new Date(entry.t)?.toLocaleDateString("en-US")
            ) || [];

          setChartData({
            labels: labels,
            datasets,
          });
        }
      }
    } catch (error: any) {
      alert(getErrorMessage(error));
    }
  };

  const handleStockSelection = (eventParams: KeyValue) => {
    const { value, checked } = eventParams;
    if (checked && selectedStocks.length < 3) {
      setSelectedStocks([...selectedStocks, value]);
    } else {
      setSelectedStocks(selectedStocks.filter((stock) => stock !== value));
    }
  };

  const handlePriceTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const updatedPriceType = event.target.value;
    setPriceType(updatedPriceType);

    let newDataSets: ChartDataSet[] = [];

    selectedStocks.map((stock) => {
      const updatedStockData = filterStockData(
        referenceData.current?.[stock]?.results,
        updatedPriceType as string
      );
      newDataSets.push({
        ...referenceData.current?.[stock]?.dataset,
        data: updatedStockData,
      });
    });

    setChartData({
      ...chartData,
      datasets: newDataSets,
    });
  };

  const handleDateRangeChange = (event: KeyValue) => {
    const { name, value } = event.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const handleStockFilter = (event: KeyValue) => {
    const keyword = event.target.value.toLowerCase();
    const filteredStocks = stockList.filter((stock) =>
      `${stock.ticker}-${stock.name}`.toLowerCase().includes(keyword)
    );
    setFilteredStockList(filteredStocks);
  };

  const handleRemoveSelectedStock = (stockToRemove: string) => {
    const updatedSelectedList = selectedStocks.filter(
      (stock) => stock !== stockToRemove
    );
    setSelectedStocks(updatedSelectedList);
  };

  return (
    <div className=" h-dvh fixed bg-[#f3f6f4]">
      <div className="flex-none text-center items-center p-4 bg-gradient-to-r from-blue-500 to-green-500 text-white h-12 text text-2xl font-bold">
        <p>{CONSTANTS.PAGE_HEADER}</p>
      </div>
      <div className="grid grid-cols-7 flex-none">
        {/* Stock List Section */}
        <div className="col-span-2 border-r border-gray-300  ">
          <div className="p-2">
            <label htmlFor="stockFilter" className="pr-2">
              {CONSTANTS.FILTER_STOCK_LBL}
            </label>
            <input
              type="text"
              id="stockFilter"
              onChange={handleStockFilter}
              className="border border-gray-300 w-max rounded-md px-2 py-1"
              placeholder={CONSTANTS.FILTER_STOCK_PLACEHOLDER}
            />
          </div>
          <div className="p-2 h-dvh overflow-y-auto">
            <label>{CONSTANTS.SELECT_STOCK_LBL}</label>
            {filteredStockList.map((stock) => (
              <div key={stock.ticker} className="flex items-center">
                <input
                  type="checkbox"
                  value={stock.ticker}
                  onChange={(e) =>
                    handleStockSelection({
                      value: e.target.value,
                      checked: e.target.checked,
                    })
                  }
                  checked={selectedStocks.includes(stock.ticker)}
                  disabled={
                    !selectedStocks.includes(stock.ticker) &&
                    selectedStocks.length >= 3
                  }
                />
                <div
                  className="truncate pl-1"
                  onClick={() =>
                    handleStockSelection({
                      value: stock.ticker,
                      checked: !selectedStocks.includes(stock.ticker),
                    })
                  }
                  onMouseEnter={(e: KeyValue) =>
                    e.target.classList.add("text-lg")
                  }
                  onMouseLeave={(e: KeyValue) =>
                    e.target.classList.remove("text-lg")
                  }
                >
                  {`${stock.ticker}-${stock.name}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="col-span-5">
          <div className="p-2 flex justify-between border-b border-gray-300">
            <div className="flex flex-wrap justify-center md:justify-start items-center">
              <label className="mr-2">{CONSTANTS.START_DATE_LBL}</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-md px-2 py-1"
              />
              <label className="ml-2 mr-2">{CONSTANTS.END_DATE_LBL}</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-md px-2 py-1"
              />
            </div>
            <div className="mt-2 md:mt-0 mr-4">
              <label>{CONSTANTS.PRICE_TYPE_LBL}</label>
              <select
                value={priceType}
                onChange={handlePriceTypeChange}
                className="ml-2 border border-gray-300 rounded-md px-2 py-1"
              >
                {priceTypeList.map(
                  (priceType: { type: string; value: string }) => {
                    return (
                      <option value={priceType.value}>{priceType.type}</option>
                    );
                  }
                )}
              </select>
            </div>
          </div>
          <div className="p-2">
            {selectedStocks?.length ? (
              <div className="flex flex-wrap">
                {selectedStocks.map((selectedStock) => (
                  <div
                    key={selectedStock}
                    className="m-2 flex items-center bg-gray-200 rounded-md p-2"
                  >
                    <span>{selectedStock}</span>
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSelectedStock(selectedStock)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a9 9 0 100 18 9 9 0 000-18zm4.95 12.122l-1.828 1.828L10 11.827l-3.122 3.123-1.827-1.828L8.173 10 5.05 6.878l1.828-1.828L10 8.173l3.122-3.122 1.828 1.828L11.827 10l3.122 3.122z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>{CONSTANTS.SELECT_STOCK_UPTO_3}</p>
            )}
          </div>
          {selectedStocks?.length ? (
            <div className="p-2 m-2 bg-white shadow-md rounded-md">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockChart;
