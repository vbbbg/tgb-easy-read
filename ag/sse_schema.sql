CREATE TABLE sse_market_summary (
    trade_date DATE PRIMARY KEY, -- 交易日期

    -- 股票 (Stock)
    stock_list_num INT, -- 上市公司数
    stock_total_value DECIMAL, -- 总市值
    stock_nego_value DECIMAL, -- 流通市值
    stock_trade_amt DECIMAL, -- 成交金额
    stock_trade_vol DECIMAL, -- 成交量
    stock_avg_pe_rate DECIMAL, -- 平均市盈率
    stock_total_to_rate DECIMAL, -- 总换手率
    stock_nego_to_rate DECIMAL, -- 流通换手率

    -- 主板A (Main Board A)
    main_a_list_num INT, -- 上市公司数
    main_a_total_value DECIMAL, -- 总市值
    main_a_nego_value DECIMAL, -- 流通市值
    main_a_trade_amt DECIMAL, -- 成交金额
    main_a_trade_vol DECIMAL, -- 成交量
    main_a_avg_pe_rate DECIMAL, -- 平均市盈率
    main_a_total_to_rate DECIMAL, -- 总换手率
    main_a_nego_to_rate DECIMAL, -- 流通换手率
    -- 主板B (Main Board B)
    main_b_list_num INT, -- 上市公司数
    main_b_total_value DECIMAL, -- 总市值
    main_b_nego_value DECIMAL, -- 流通市值
    main_b_trade_amt DECIMAL, -- 成交金额
    main_b_trade_vol DECIMAL, -- 成交量
    main_b_avg_pe_rate DECIMAL, -- 平均市盈f率
    main_b_total_to_rate DECIMAL, -- 总换手率
    main_b_nego_to_rate DECIMAL, -- 流通换手率
    -- 科创板 (Sci-Tech Board)
    sci_tech_list_num INT, -- 上市公司数
    sci_tech_total_value DECIMAL, -- 总市值
    sci_tech_nego_value DECIMAL, -- 流通市值
    sci_tech_trade_amt DECIMAL, -- 成交金额
    sci_tech_trade_vol DECIMAL, -- 成交量
    sci_tech_avg_pe_rate DECIMAL, -- 平均市盈率
    sci_tech_total_to_rate DECIMAL, -- 总换手率
    sci_tech_nego_to_rate DECIMAL, -- 流通换手率
    -- 股票回购 (Stock Repo)
    repo_list_num INT, -- 上市公司数
    repo_total_value DECIMAL, -- 总市值
    repo_nego_value DECIMAL, -- 流通市值
    repo_trade_amt DECIMAL, -- 成交金额
    repo_trade_vol DECIMAL, -- 成交量
    repo_avg_pe_rate DECIMAL, -- 平均市盈率
    repo_total_to_rate DECIMAL, -- 总换手率
    repo_nego_to_rate DECIMAL -- 流通换手率
);
