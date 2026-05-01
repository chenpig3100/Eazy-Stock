export type TabParamList = {
  Home: undefined
  Stocks: undefined
  Portfolio: undefined
  Alerts: undefined
  Settings: undefined
}

export type StocksStackParamList = {
  StocksList: undefined
  StockDetail: { symbol: string; name: string }
  NewsWebView: { url: string; title: string }
}
