import React, { useRef, useEffect, useCallback } from 'react';

import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import {jsonData} from './jsonData';

echarts.use([TitleComponent, TooltipComponent, GraphChart, SVGRenderer]);

export default function Charts() {
  const ref = useRef(null);
  let mapInstance = null;
  
  const links = generateLinks(jsonData);
  const renderChart = useCallback(() => {
    mapInstance = echarts.init(ref.current);
    mapInstance.setOption({
        title: {
            text: 'Currency Flows',
            textStyle: {
                color: '#b2c2ffff',
                fontSize: 20,
                fontWeight: 'bold',
            },
        },
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
            type: 'graph',
            layout: 'force',
            symbol: 'rect',
            symbolSize: 20,
            roam: true,
            label: {
                show: true
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
                show: false,
                fontSize: 10,
            },
            draggable: true,
            itemStyle: {
                color: '#b2c2ffff'
            },
            emphasis: {
                lineStyle: {
                    color: '#be2e82ff',
                    width: 2,
                    type: [5, 10],
                    dashOffset: 5,
                },
                label: {
                    show: true,
                    shadowOffsetX: 3,
                },
                scale: true,
                focus: 'adjacency',
                blurScope: 'series'
            },
            force: {
                initLayout: 'circular',
                gravity: 0.2,
                repulsion: 1000,
                edgeLength: 100,
            },
            autoCurveness: true,
            data: [
                {
                    name: 'A',
                },
                {
                    name: 'B',
                },
                {
                    name: 'C',
                },
                {
                    name: 'D',
                },
                {
                    name: 'E',
                },
                {
                    name: 'F',
                },
                {
                    name: 'G',
                },
                {
                    name: 'I',
                },
                {
                    name: 'J',
                }
            ],
            links: links,
            lineStyle: {
                opacity: 0.9,
                width: 2,
            },
            }
        ]
    })
  }, [links])

  useEffect(() => {
    renderChart();
  }, []);

  return (
    <div>
      <div style={{ width: "1400px", height: "100vh" }} ref={ref}></div>
    </div>
  );
}

function generateLinks(data) {
    return data.map((data, i) => {
        return {
            source: data[0],
            target: data[1],
            label: {
                // show: true
            },
        }
    })
}