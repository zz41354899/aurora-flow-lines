# 🌌 Aurora Flow Lines

一個使用 Vue 3 + Vite + p5.js 開發的極光互動效果專案。

## ✨ 特色功能

- **流動場動畫**：使用 Perlin Noise 建立自然流動的極光線條
- **HSB 色彩模式**：模擬真實極光的發光效果
- **混合光暈**：使用 `blendMode(ADD)` 創造柔和的光線交疊
- **即時互動**：
  - 🖱️ 滑鼠移動影響流動方向
  - 🔄 滾輪調整粒子密度 (200-2000)
  - 🎨 點擊控制面板切換色彩模式
  - ⌨️ 鍵盤 1-3 快速切換模式

## 🎨 三種極光模式

| 模式 | 特性 | HSB 色域 |
|------|------|----------|
| **Calm** | 冷靜藍綠、北極夜空 | 180-220 |
| **Ripple** | 紫粉漣漪、夢幻反射 | 240-300 |
| **Storm** | 綠光閃耀、能量釋放 | 100-160 |

## 📁 專案結構

```
src/
├── components/
│   ├── P5Canvas.vue        # p5.js 主畫布（繪圖邏輯）
│   └── ControlPanel.vue    # 控制模式與速度
├── views/
│   └── Home.vue            # 組合畫布與控制介面
├── style.css               # 全局樣式（深色夜空背景）
├── App.vue
└── main.js
```

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

## 🎯 技術實現

### 流動場計算
```javascript
angle = noise(x * scale, y * scale, zoff) * TWO_PI * 2
```

### 顏色動態變化
```javascript
hue = baseHue + sin(frameCount * 0.01) * 40
```

### 粒子系統
- 1000 個預設粒子
- 依噪聲場移動
- 自動邊界循環
- 動態透明度與亮度

## 🎨 視覺設計

- **背景**：深色徑向漸層 (`#0a0f2b` → `#010104`)
- **線條**：HSB 色彩模式，動態色相變化
- **混合模式**：ADD 模式模擬極光發光
- **控制面板**：毛玻璃效果 (`backdrop-filter: blur(10px)`)

## 📦 依賴套件

- **Vue 3** - 響應式框架
- **Vite** - 快速建置工具
- **p5.js** - 創意編程庫

## 🌈 色彩設計理念

極光的色彩來自太陽風與大氣層的交互作用：
- **藍綠色**：氮分子發光（冷靜模式）
- **紫粉色**：氮離子發光（漣漪模式）
- **綠色**：氧原子發光（風暴模式）

## 💡 開發筆記

- 使用原生 CSS，不依賴 UI 框架
- 所有樣式統一在 `style.css`
- p5.js 實例在組件掛載時創建，卸載時銷毀
- 使用 Vue 3 Composition API (`<script setup>`)

---

**Created with ❤️ using Vue 3 + Vite + p5.js**
