---
title: 彻底消除codex重连问题
date: 2026-10-3
excerpt: 强制禁用 WebSocket，彻底消除重连。
tags:
  - 软件设置
  - codex
---
Codex 出现“Reconnecting 1/5→5/5”通常是 WebSocket 在代理环境下握手失败，常见的解决方法是在 `~/.codex/.env` 中正确配置 HTTP/HTTPS 代理变量并完整重启 Codex。
## 步骤：

1. 编辑 `~/.codex/.env`，写入你的代理端口（示例 7890， 请换成你自己的）：

```
HTTP_PROXY="http://127.0.0.1:7890"
HTTPS_PROXY="http://127.0.0.1:7890"
ALL_PROXY="socks5h://127.0.0.1:7890"
NO_PROXY="localhost,127.0.0.1,::1"
```

2. 重启 Codex。

但此方法在切换代理软件时可能因为端口不一致，需要重新修改，比较麻烦。最彻底的解决方法是强制禁用 WebSocket。方法如下：

## 步骤：

1. 编辑 `~/.codex/config.toml`：

```
model_provider = "openai_http"

[model_providers.openai_http]
name = "OpenAI"
wire_api = "responses"
requires_openai_auth = true
supports_websockets = false
```

2. 重启 Codex。
