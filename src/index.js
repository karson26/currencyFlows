import React from 'react';
import ReactDOM from 'react-dom/client';
// import { pipeline } from '@huggingface/transformers';

import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
// const classifier = await pipeline(
//   "sentiment-analysis",
//   "Xenova/robertuito-sentiment-analysis"
// );

// // 执行情感分析
// const result = await classifier("I love Transformers.js!");
// console.log(result);


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);