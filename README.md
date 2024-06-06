# 描述

该项目是 node+express+mysql+redis 的框架
目的是开箱即用，基本配置都配好了 在 env 中调参数即可使用

目录结构

```

├── db                      # 数据库操作
├── public                  # 公共
├── router                  # 接口路径
├── store                   # 储存
├── utils                   # 工具库
│   ├── crypto.js           # token加密
│   ├── dbConfig            # 数据库配置
│   ├── message             # 全局消息返回
│   ├── redisClient         # redis配置
│   └── rulesForm           # 表单验证
├── .env                    # 全局配置
└── index                   # main
```
