import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { setup } from '@twind/core'
import twindConfig from './twind.config'

// 初始化TwindCSS配置
setup(twindConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)