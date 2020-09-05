[TODO]:
    覆盖 log 函数

核心思想：
    把 parser function 和 token type 关联起来，每个 token type 最多有两个 parse function 关联，根据是前缀还是中缀（暂时不考虑后缀）
    

存疑：
    这样生成了 ast，该如何计算呢