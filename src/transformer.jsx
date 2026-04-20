import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline(
  "sentiment-analysis",
  "Xenova/robertuito-sentiment-analysis"
);

// 执行情感分析
const result = await classifier("I love Transformers.js!");
console.log(result);
