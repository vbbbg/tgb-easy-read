CREATE TABLE szse_market_summary (
    trade_date DATE NOT NULL, -- 交易日期
    trade_category VARCHAR(255) NOT NULL, -- 证券类别 (例如: 股票, 主板A股)
    quantity INT, -- 数量(只)
    trade_amount DECIMAL, -- 成交金额(亿元)
    total_market_cap DECIMAL, -- 总市值(亿元)
    negotiable_market_cap DECIMAL, -- 流通市值(亿元)
    PRIMARY KEY (trade_date, trade_category) -- 使用日期和类别作为联合主键
);

COMMENT ON TABLE szse_market_summary IS '深交所市场总貌数据';
COMMENT ON COLUMN szse_market_summary.trade_date IS '交易日期';
COMMENT ON COLUMN szse_market_summary.trade_category IS '证券类别';
COMMENT ON COLUMN szse_market_summary.quantity IS '数量(只)';
COMMENT ON COLUMN szse_market_summary.trade_amount IS '成交金额(亿元)';
COMMENT ON COLUMN szse_market_summary.total_market_cap IS '总市值(亿元)';
COMMENT ON COLUMN szse_market_summary.negotiable_market_cap IS '流通市值(亿元)';
