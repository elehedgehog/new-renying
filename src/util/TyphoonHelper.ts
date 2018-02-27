let L = window['L']
export class TyphoonHelper {
    constructor(map) {
        this.map = map;
    }
    map
    drawTy = (tyData) => {
        if (!tyData) {
            console.error("台风数据为空");
            return
        }
        console.log(tyData);
        const map = this.map;
        const tyName = tyData.tscname,
            tyId = tyData.tsid,
            realPoints = tyData.real,
            time = new Date(tyData.real[tyData.real.length - 1].time.replace(/\-/g, "/")),

            fstPoints = tyData.fst.sort((a, b) => Number(a.leadtime) - Number(b.leadtime)),

            realFirstPointDegrees = [realPoints[realPoints.length - 1].lat,
                realPoints[realPoints.length - 1].lon
            ],
            windCircle = getWindCircle(realPoints[realPoints.length - 1]);
        let isRealLastPoint = false,
            isfstLastPoint = false,
            realPointCounter = 0,
            fstPointCounter = 0,
            realLastPoint = [realPoints[realPoints.length - 1].lon,
                realPoints[realPoints.length - 1].lat
            ],
            tyLayerGroup = L.layerGroup(),
            layerHolder,
            popupHolder,
            realSpeedHolder: any = [],
            fstSpeedHolder: any = [],
            fstAreaPointsHolder: any = [],
            layersGoesBack: any = [];
            console.log(tyLayerGroup)
        let fstSidePints: any = [], //这个是用来临时所有的预报边点集合
            fstSemicilePoints: any = [], //临时保存半圆点
            fstAreaPoints = [
                [realPoints[realPoints.length - 1].lat,
                    realPoints[realPoints.length - 1].lon
                ]
            ]; //这个是用来保存实际绘制用到的点集合

        // 添加台风layer group
        tyLayerGroup.addTo(map);
        // 时间修正为北京时间
        // time.setHours(time.getHours() + 8);
        // 计算台风移动速度
        if (realPoints.length == 1) { // 只有一个实测点的情况
            let prePointDgrees = [realPoints[realPoints.length - 1].lon, realPoints[realPoints.length - 1].lat],
            pointDgrees = [fstPoints[0].lon, fstPoints[0].lat],
            timeDiff = Number(fstPoints[0].leadtime);
            realSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
            if (fstPoints.length == 1) { //只有一个预测点的情况
                fstSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
            } else { //大于一个预测点的情况
                fstSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
                fstPoints.forEach((el, i, arr) => {
                    if (i == 0) return
                    timeDiff = arr[i].leadtime - arr[i - 1].leadtime;
                    fstSpeedHolder.push(Number(computeDistance(arr[i - 1].lon, arr[i - 1].lat, arr[i].lon, arr[i].lat) / timeDiff).toFixed(1))
                })
            }
        } else { // 大于一个实测点的情况
            let prePointDgrees = [realPoints[0].lon, realPoints[0].lat],
                pointDgrees = [realPoints[1].lon, realPoints[1].lat],
                timeDiff = getDateDiff(realPoints[0].time, realPoints[1].time, 'h');
            realSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
            realPoints.forEach((el, i, arr) => {
                if (i == 0) return
                timeDiff = getDateDiff(arr[i - 1].time, arr[i].time, 'h')
                realSpeedHolder.push(Number(computeDistance(arr[i - 1].lon, arr[i - 1].lat, arr[i].lon, arr[i].lat) / timeDiff).toFixed(1))
            })
            if (fstPoints.length == 1) { //只有一个预测点的情况
                prePointDgrees = [realPoints[realPoints.length - 1].lon, realPoints[realPoints.length - 1].lat];
                pointDgrees = [fstPoints[0].lon, fstPoints[0].lat];
                timeDiff = Number(fstPoints[0].leadtime);
                fstSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
            } else { //大于一个预测点的情况
                prePointDgrees = [realPoints[realPoints.length - 1].lon, realPoints[realPoints.length - 1].lat];
                pointDgrees = [fstPoints[0].lon, fstPoints[0].lat];
                timeDiff = Number(fstPoints[0].leadtime);
                fstSpeedHolder.push(Number(computeDistance(prePointDgrees[0], prePointDgrees[1], pointDgrees[0], pointDgrees[1]) / timeDiff).toFixed(1))
                fstPoints.forEach((el, i, arr) => {
                    if (i == 0) return
                    timeDiff = arr[i].leadtime - arr[i - 1].leadtime;
                    fstSpeedHolder.push(Number(computeDistance(arr[i - 1].lon, arr[i - 1].lat, arr[i].lon, arr[i].lat) / timeDiff).toFixed(1))
                })
            }
        }
        // 获取所有边缘点
        fstPoints.forEach((el, i, arr) => {
            if (i == 0) {
                fstSidePints.push(getSidePoints(realPoints[realPoints.length - 1].lon, realPoints[realPoints.length - 1].lat, el.lon, el.lat, getFstR(el.leadtime)))
            } else {
                fstSidePints.push(getSidePoints(arr[i - 1].lon, arr[i - 1].lat, el.lon, el.lat, getFstR(el.leadtime)))
            }
        });
        // 判断最后一个预报点左点的纬度是否大于右点的纬度
        let isLeftBigger = false;
        if (fstSidePints[fstSidePints.length - 1].left.lat > fstSidePints[fstSidePints.length - 1].right.lat) {
            isLeftBigger = true;
        }
        // 计算圆弧点
        fstSemicilePoints = getHalfPoints(fstSidePints[fstSidePints.length - 1].right, fstSidePints[fstSidePints.length - 1].left, 45, isLeftBigger);
        // 将预报的边界点按顺序推入数组中
        fstSidePints.forEach((el) => {
            fstAreaPointsHolder.push(el.left.lat, el.left.lon);
        })
        fstAreaPointsHolder = getCurvePoints(fstAreaPointsHolder, .5, 10, false);
        for (let i = 0; i < fstAreaPointsHolder.length; i += 2) {
            fstAreaPoints.push([fstAreaPointsHolder[i], fstAreaPointsHolder[i + 1]]);
        }
        fstAreaPointsHolder = [];
        if (isLeftBigger == true) {
            for (let i = 0; i < fstSemicilePoints.length; i += 2) {
                fstAreaPoints.push([fstSemicilePoints[i + 1], fstSemicilePoints[i]])
            }
        } else {
            for (let i = fstSemicilePoints.length - 1; i > 0; i -= 2) {
                fstAreaPoints.push([fstSemicilePoints[i], fstSemicilePoints[i - 1]])
            }
        }
        // 右边点顺序必须反转才能准确绘制
        fstSidePints.reverse().forEach((el) => {
            fstAreaPointsHolder.push(el.right.lat, el.right.lon);
        })
        fstAreaPointsHolder = getCurvePoints(fstAreaPointsHolder, .5, 10, false);
        for (let i = 0; i < fstAreaPointsHolder.length; i += 2) {
            fstAreaPoints.push([fstAreaPointsHolder[i], fstAreaPointsHolder[i + 1]]);
        }
        fstAreaPointsHolder = [];
        // console.log(fstAreaPoints);
        // for(let i=0; i<fstAreaPointsHolder.length; i+=2){
        //     fstAreaPoints.push([fstAreaPointsHolder[i], fstAreaPointsHolder[i+1]]);
        // }
        // 恢复原数组
        fstSidePints.reverse();

        //在起点位置添加台风名称
		if(realPoints.length) {
			const tyNameLabel = L.divIcon({
				className: 'ty-name-label',
                html: `<span style="color: black; white-space: nowrap;">
                    ${tyName}${tyData.tsename ? tyData.tsename : ''}
                    </span>`,
				iconAnchor: [-15, 9]
			});
			tyLayerGroup.addLayer(L.marker([realPoints[0].lat, realPoints[0].lon], {icon: tyNameLabel}));
		}

		// 台风名称自定义icon
      tyName ? tyName : '未命名'
      let wid= tyName.length*12+16
		const divIcon = L.divIcon({
			className: 'ty-name',
			bgPos: [105, 0],
			html: `<div></div>`
		})
		let tipHolder = L.marker(realPoints[realPoints.length - 1], { icon: divIcon });

        // 当前台风gif
        let iconClass = realFirstPointDegrees[0] > 0 ? 'rotate_ani' : 'positive_rotate_ani'
        let curMarker = L.divIcon({
            className: 'typhoon_icon',
            html: `<div><img class="${iconClass}" style="width:30px;height:30px" src="${getCurMKByLevel(realPoints[realPoints.length - 1])}"></div>`
        });
        const curPosMk = L.marker(realFirstPointDegrees, {
            icon: curMarker,
            zIndexOffset: 2000,
        }).on('click', (e) => {
            const popup = createTyPointPopup(realPoints[realPoints.length - 1], true);
            //e.target.bindPopup(popup).openPopup();
            e.target.unbindPopup().bindPopup(popup).openPopup();
			tipHolder.setOpacity(1);
        }).on('mouseover', () => {
            for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                if (!realPoints[realPoints.length - 1][el]) continue
                let circle = L.circle([realPoints[realPoints.length - 1].lat, realPoints[realPoints.length - 1].lon], {
                    radius: realPoints[realPoints.length - 1][el] * 1000,
                    color: getWindColor(el),
                    weight: 2,
                    opacity: 0.8,
                    renderer: window["windRenderer"]
                })
                circle.id = "windCircle"
                circle.addTo(map)
            }
        }).on('mouseout', () => {
            map.eachLayer(e => {
                if (e.id === 'windCircle')
                    map.removeLayer(e)
            })
        })

        tyLayerGroup.addLayer(curPosMk);
        // 台风只有一个实况点的情况
        if (realPoints.length == 1) {
            curPosMk.setLatLng([realPoints[realPointCounter].lat,
                realPoints[realPointCounter].lon
            ])
            // 实况点最后一个点
            popupHolder = createTyPointPopup(realPoints[realPointCounter], true);
            let circleMarker = L.circleMarker([realPoints[realPoints.length - 1].lat,
                realPoints[realPoints.length - 1].lon
            ], {
                zIndexOffset: 2000,
                radius: 6,
                weight: 1.5,
                color: getColorByLevel(realPoints[realPointCounter].level, true),
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColorByLevel(realPoints[realPointCounter].level)
            }).bindPopup(popupHolder)

            let realPointData = realPoints[realPointCounter]
            circleMarker.on('mouseover', () => {
                for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                    if (!realPointData[el]) continue
                    let circle = L.circle([realPointData.lat, realPointData.lon], {
                        radius: realPointData[el] * 1000,
                        color: getWindColor(el),
                        weight: 2,
                        opacity: 0.8,
                        renderer: window["windRenderer"]
                    })
                    circle.id = "windCircle"
                    circle.addTo(map)
                }
            }).on('mouseout', () => {
                map.eachLayer(e => {
                    if (e.id === 'windCircle')
                        map.removeLayer(e)
                })
            })

            tyLayerGroup.addLayer(circleMarker);
            curPosMk.setLatLng([realPoints[realPoints.length - 1].lat,
                realPoints[realPoints.length - 1].lon
            ])
            // 台风名称自定义icon
            tyLayerGroup.addLayer(tipHolder);

            // 动画开始
            const realPointsInterval = setInterval(() => {
                // 实况点与预报点之间的线段
                layerHolder = L.polyline([
                    [realPoints[realPoints.length - 1].lat,
                        realPoints[realPoints.length - 1].lon
                    ],
                    [fstPoints[fstPointCounter].lat,
                        fstPoints[fstPointCounter].lon
                    ]
                ], {
                    dashArray: '15, 10',
                    dashOffset: '8',
                    color: getColorByLevel(fstPoints[fstPointCounter].level),
                    weight: 1
                });
                tyLayerGroup.addLayer(layerHolder);
                layerHolder.bringToBack();
                layersGoesBack.push({
                    layer: layerHolder
                });
                clearInterval(realPointsInterval);
                const fstPointsInterval = setInterval(() => {
                    if (fstPointCounter != fstPoints.length - 1) {
                        popupHolder = createTyPointPopup(fstPoints[fstPointCounter]);
                        let circleMarker = L.circleMarker([fstPoints[fstPointCounter].lat,
                            fstPoints[fstPointCounter].lon
                        ], {
                            zIndexOffset: 2000,
                            radius: 6,
                            color: getColorByLevel(fstPoints[fstPointCounter].level, true),
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 1,
                            fillColor: getColorByLevel(fstPoints[fstPointCounter].level)
                        }).bindPopup(popupHolder)

                        let fstPointData = fstPoints[fstPointCounter]
                        circleMarker.on('mouseover', () => {
                            for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                                if (!fstPointData[el]) continue
                                let circle = L.circle([fstPointData.lat, fstPointData.lon], {
                                    radius: fstPointData[el] * 1000,
                                    color: getWindColor(el),
                                    weight: 2,
                                    opacity: 0.8,
                                    renderer: window["windRenderer"]
                                })
                                circle.id = "windCircle"
                                circle.addTo(map)
                            }
                        }).on('mouseout', () => {
                            map.eachLayer(e => {
                                if (e.id === 'windCircle')
                                    map.removeLayer(e)
                            })
                        })

                        tyLayerGroup.addLayer(circleMarker);
                        // 台风点之间的线段
                        if (fstPointCounter > 0) {
                            layerHolder = L.polyline([
                                [fstPoints[fstPointCounter - 1].lat,
                                    fstPoints[fstPointCounter - 1].lon
                                ],
                                [fstPoints[fstPointCounter].lat,
                                    fstPoints[fstPointCounter].lon
                                ]
                            ], {
                                dashArray: '8, 8',
                                dashOffset: '10',
                                color: getColorByLevel(fstPoints[fstPointCounter].level),
                                weight: 1
                            });
                            tyLayerGroup.addLayer(layerHolder);
                            layerHolder.bringToBack();
                            layersGoesBack.push({
                                layer: layerHolder
                            });
                        }
                        fstPointCounter++;
                    } else {
                        clearInterval(fstPointsInterval);
                        popupHolder = createTyPointPopup(fstPoints[fstPoints.length - 1])
                        let circleMarker = L.circleMarker([fstPoints[fstPoints.length - 1].lat,
                            fstPoints[fstPoints.length - 1].lon
                        ], {
                            zIndexOffset: 2000,
                            radius: 6,
                            color: getColorByLevel(fstPoints[fstPoints.length - 1].level, true),
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 1,
                            fillColor: getColorByLevel(fstPoints[fstPoints.length - 1].level)
                        }).bindPopup(popupHolder)

                        let fstPointData = fstPoints[fstPoints.length - 1]
                        circleMarker.on('mouseover', () => {
                            for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                                if (!fstPointData[el]) continue
                                let circle = L.circle([fstPointData.lat, fstPointData.lon], {
                                    radius: fstPointData[el] * 1000,
                                    color: getWindColor(el),
                                    weight: 2,
                                    opacity: 0.8,
                                    renderer: window["windRenderer"]
                                })
                                circle.id = "windCircle"
                                circle.addTo(map)
                            }
                        }).on('mouseout', () => {
                            map.eachLayer(e => {
                                if (e.id === 'windCircle')
                                    map.removeLayer(e)
                            })
                        })

                        tyLayerGroup.addLayer(circleMarker);
                        // 最后一段线段
                        if (fstPoints.length > 1) {
                            layerHolder = L.polyline([
                                [fstPoints[fstPoints.length - 2].lat,
                                    fstPoints[fstPoints.length - 2].lon
                                ],
                                [fstPoints[fstPoints.length - 1].lat,
                                    fstPoints[fstPoints.length - 1].lon
                                ]
                            ], {
                                dashArray: '8, 8',
                                dashOffset: '10',
                                color: getColorByLevel(fstPoints[fstPoints.length - 1].level),
                                weight: 1
                            });
                            tyLayerGroup.addLayer(layerHolder);
                            layerHolder.bringToBack();
                            layersGoesBack.push({
                                layer: layerHolder
                            });
                        }

                        // 动画结束，绘制区域
                        layerHolder = L.polygon(fstAreaPoints, {
                            color: 'red',
                            weight: 1.5,
                            opacity: 1,
                            dashArray: '4, 5',
                            dashOffset: '2',
                            fillColor: 'red',
                            fillOpacity: .3
                        })
                        tyLayerGroup.addLayer(layerHolder);
                        layersGoesBack.push({
                            layer: layerHolder
                        });
                        layerHolder.bringToBack();
                        // // 绘制风圈
                        // let lastPoint = realLastPoint,
                        //     lastPointData = realPoints[realPoints.length - 1];
                        // // 判断是否纬度在前
                        // if (lastPoint[0] > lastPoint[1]) lastPoint.reverse()
                        // for (let i in windCircle) {
                        //     tyLayerGroup.addLayer(L.circle(lastPoint, lastPointData[i] * 1000, {
                        //         zIndexOffset: 2000,
                        //         color: getWindColor(i),
                        //         weight: 1,
                        //         fill: false
                        //     }))
                        // }

                        //添加点击地图其他区域隐藏距离提示框
						this.map.on('click', () => {
							tipHolder.setOpacity(0);
						})
                    }
                }, 25)
            }, 25)
        }
        
        // 实况点一个以上
        if (realPoints.length > 1) {
            const realPointsInterval = setInterval(() => {
                if (realPointCounter != realPoints.length - 1) {
                    if (!map.hasLayer(tyLayerGroup)) {
                        return;
                    }
                    // 台风点之间的线段
                    if (realPointCounter > 0) {
                        layerHolder = L.polyline([
                            [realPoints[realPointCounter - 1].lat,
                                realPoints[realPointCounter - 1].lon
                            ],
                            [realPoints[realPointCounter].lat,
                                realPoints[realPointCounter].lon
                            ]
                        ], {
                            color: getColorByLevel(realPoints[realPointCounter].level),
                            weight: 3
                        });
                        tyLayerGroup.addLayer(layerHolder);
                        layerHolder.bringToBack();
                        layersGoesBack.push({
                            layer: layerHolder
                        });
                    }
                    popupHolder = createTyPointPopup(realPoints[realPointCounter], true, realPointCounter);
                    let circleMarker = L.circleMarker([realPoints[realPointCounter].lat,
                        realPoints[realPointCounter].lon
                    ], {
                        zIndexOffset: 2000,
                        radius: 6,
                        weight: 1,
                        color: getColorByLevel(realPoints[realPointCounter].level, true),
                        opacity: 1,
                        fillOpacity: 1,
                        fillColor: getColorByLevel(realPoints[realPointCounter].level)
                    }).bindPopup(popupHolder)

                    /* 风圈 */
                    let realPointData = realPoints[realPointCounter]
                    circleMarker.on('mouseover', () => {
                        for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                            if (!realPointData[el]) continue
                            let circle = L.circle([realPointData.lat, realPointData.lon], {
                                radius: realPointData[el] * 1000,
                                color: getWindColor(el),
                                weight: 2,
                                opacity: 0.8,
                                renderer: window["windRenderer"]
                            })
                            circle.id = "windCircle"
                            circle.addTo(map)
                        }
                    }).on('mouseout', () => {
                        map.eachLayer(e => {
                            if (e.id === 'windCircle')
                                map.removeLayer(e)
                        })
                    })

                    tyLayerGroup.addLayer(circleMarker);
                    realPointCounter++;
                    curPosMk.setLatLng([realPoints[realPointCounter].lat,
                        realPoints[realPointCounter].lon
                    ])
                  this.map.setView([realPoints[realPointCounter].lat,
                    realPoints[realPointCounter].lon ], 6, {
                        animate:true,
                        duration:0,
                        noMoveStart:true,
                    });
                } else {
                    clearInterval(realPointsInterval);
                    // 实况点最后一个点
                    popupHolder = createTyPointPopup(realPoints[realPointCounter], true, realPoints.length - 1);
                    let circleMarker = L.circleMarker([realPoints[realPoints.length - 1].lat,
                        realPoints[realPoints.length - 1].lon
                    ], {
                        radius: 6,
                        weight: 1.5,
                        color: getColorByLevel(realPoints[realPointCounter].level, true),
                        opacity: 1,
                        fillOpacity: 1,
                        fillColor: getColorByLevel(realPoints[realPointCounter].level)
                    }).bindPopup(popupHolder)

                    let realPointData = realPoints[realPointCounter]
                    circleMarker.on('mouseover', () => {
                        for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                            if (!realPointData[el]) continue
                            let circle = L.circle([realPointData.lat, realPointData.lon], {
                                radius: realPointData[el] * 1000,
                                color: getWindColor(el),
                                weight: 2,
                                opacity: 0.8,
                                renderer: window["windRenderer"]
                            })
                            circle.id = "windCircle"
                            circle.addTo(map)
                        }
                    }).on('mouseout', () => {
                        map.eachLayer(e => {
                            if (e.id === 'windCircle')
                                map.removeLayer(e)
                        })
                    })

                    tyLayerGroup.addLayer(circleMarker);
                    curPosMk.setLatLng([realPoints[realPoints.length - 1].lat,
                        realPoints[realPoints.length - 1].lon
                    ])

                    tyLayerGroup.addLayer(tipHolder);

                    layerHolder = L.polyline([
                        [realPoints[realPoints.length - 2].lat,
                            realPoints[realPoints.length - 2].lon
                        ],
                        [realPoints[realPoints.length - 1].lat,
                            realPoints[realPoints.length - 1].lon
                        ]
                    ], {
                        color: getColorByLevel(fstPoints[fstPointCounter].level),
                        weight: 3
                    });
                    tyLayerGroup.addLayer(layerHolder);
                    layerHolder.bringToBack();
                    layersGoesBack.push({
                        layer: layerHolder
                    });
                    // 实况点与预报点之间的线段
                    layerHolder = L.polyline([
                        [realPoints[realPoints.length - 1].lat,
                            realPoints[realPoints.length - 1].lon
                        ],
                        [fstPoints[fstPointCounter].lat,
                            fstPoints[fstPointCounter].lon
                        ]
                    ], {
                        dashArray: '15, 10',
                        dashOffset: '8',
                        color: getColorByLevel(fstPoints[fstPointCounter].level),
                        weight: 1
                    });
                    tyLayerGroup.addLayer(layerHolder);
                    layerHolder.bringToBack();
                    layersGoesBack.push({
                        layer: layerHolder
                    });
                    const fstPointsInterval = setInterval(() => {
                        if (fstPointCounter != fstPoints.length - 1) {
                            popupHolder = createTyPointPopup(fstPoints[fstPointCounter], false, fstPointCounter);
                            let circleMarker = L.circleMarker([fstPoints[fstPointCounter].lat,
                                fstPoints[fstPointCounter].lon
                            ], {
                                zIndexOffset: 2000,
                                radius: 6,
                                color: getColorByLevel(fstPoints[fstPointCounter].level, true),
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 1,
                                fillColor: getColorByLevel(fstPoints[fstPointCounter].level)
                            }).bindPopup(popupHolder)

                            let fstPointData = fstPoints[fstPointCounter]
                            circleMarker.on('mouseover', () => {
                                for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                                    if (!fstPointData[el]) continue
                                    let circle = L.circle([fstPointData.lat, fstPointData.lon], {
                                        radius: fstPointData[el] * 1000,
                                        color: getWindColor(el),
                                        weight: 2,
                                        opacity: 0.8,
                                        renderer: window["windRenderer"]
                                    })
                                    circle.id = "windCircle"
                                    circle.addTo(map)
                                }
                            }).on('mouseout', () => {
                                map.eachLayer(e => {
                                    if (e.id === 'windCircle')
                                        map.removeLayer(e)
                                })
                            })

                            tyLayerGroup.addLayer(circleMarker);
                            // 台风点之间的线段
                            if (fstPointCounter > 0) {
                                layerHolder = L.polyline([
                                    [fstPoints[fstPointCounter - 1].lat,
                                        fstPoints[fstPointCounter - 1].lon
                                    ],
                                    [fstPoints[fstPointCounter].lat,
                                        fstPoints[fstPointCounter].lon
                                    ]
                                ], {
                                    dashArray: '8, 8',
                                    dashOffset: '10',
                                    color: getColorByLevel(fstPoints[fstPointCounter].level),
                                    weight: 1
                                });
                                tyLayerGroup.addLayer(layerHolder);
                                layerHolder.bringToBack();
                                layersGoesBack.push({
                                    layer: layerHolder
                                });
                            }
                            fstPointCounter++;
                        } else {
                            clearInterval(fstPointsInterval);
                            popupHolder = createTyPointPopup(fstPoints[fstPoints.length - 1], false, fstPoints.length - 1);
                            let circleMarker = L.circleMarker([fstPoints[fstPoints.length - 1].lat,
                                fstPoints[fstPoints.length - 1].lon
                            ], {
                                zIndexOffset: 2000,
                                radius: 6,
                                color: getColorByLevel(fstPoints[fstPoints.length - 1].level, true),
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 1,
                                fillColor: getColorByLevel(fstPoints[fstPoints.length - 1].level)
                            }).bindPopup(popupHolder)

                            let fstPointData = fstPoints[fstPoints.length - 1]
                            circleMarker.on('mouseover', () => {
                                for (let el of [ 'rr06', 'rr07', 'rr08', 'rr10' ]) {
                                    if (!fstPointData[el]) continue
                                    let circle = L.circle([fstPointData.lat, fstPointData.lon], {
                                        radius: fstPointData[el] * 1000,
                                        color: getWindColor(el),
                                        weight: 2,
                                        opacity: 0.8,
                                        renderer: window["windRenderer"]
                                    })
                                    circle.id = "windCircle"
                                    circle.addTo(map)
                                }
                            }).on('mouseout', () => {
                                map.eachLayer(e => {
                                    if (e.id === 'windCircle')
                                        map.removeLayer(e)
                                })
                            })
                            
                            tyLayerGroup.addLayer(circleMarker);
                            // 最后一段线段
                            if (fstPoints.length > 1) {
                                layerHolder = L.polyline([
                                    [fstPoints[fstPoints.length - 2].lat,
                                        fstPoints[fstPoints.length - 2].lon
                                    ],
                                    [fstPoints[fstPoints.length - 1].lat,
                                        fstPoints[fstPoints.length - 1].lon
                                    ]
                                ], {
                                    dashArray: '8, 8',
                                    dashOffset: '10',
                                    color: getColorByLevel(fstPoints[fstPoints.length - 1].level),
                                    weight: 1
                                });
                                tyLayerGroup.addLayer(layerHolder);
                                layerHolder.bringToBack();
                                layersGoesBack.push({
                                    layer: layerHolder
                                });
                            }
                            // 动画结束，绘制区域

                            layerHolder = L.polygon(fstAreaPoints, {
                                color: 'red',
                                weight: 1.5,
                                opacity: 1,
                                dashArray: '4, 5',
                                dashOffset: '2',
                                fillColor: 'red',
                                fillOpacity: .3
                            })
                            tyLayerGroup.addLayer(layerHolder);
                            layersGoesBack.push({
                                layer: layerHolder
                            });
                            layerHolder.bringToBack();
                            // // 绘制风圈
                            // let lastPoint = realLastPoint,
                            //     lastPointData = realPoints[realPoints.length - 1];
                            // // 判断是否纬度在前
                            // if (lastPoint[0] > lastPoint[1]) lastPoint.reverse()
                            // for (let i in windCircle) {
                            //     tyLayerGroup.addLayer(L.circle(lastPoint, lastPointData[i] * 1000, {
                            //         zIndexOffset: 2000,
                            //         color: getWindColor(i),
                            //         weight: 1,
                            //         fill: false
                            //     }))
                            // }

                            //添加点击地图其他区域隐藏距离提示框
                            this.map.on('click', () => {
                                tipHolder.setOpacity(0);
                            })
                        }
                    }, 25)
                }
            }, 25)
        }

        function createTyPointPopup(data, isRealPoint = false, order = 0) {
            let n;
            if (isRealPoint) {
                // n = new Date(data.datetime);
                n = new Date(data.time.replace(/\-/g, "/"));
                // 修正为北京时间
                // n.setHours(n.getHours() + 8);
                return L.popup({
                    className: 'ty-popup',
                    closeButton: false
                }).setContent(`<section class="typhoon-popup">
                <ul>
                   <li><span>${tyName}</span></li>
                   <li><span>时间</span><span>${n.getMonth()+1} 月${n.getDate()} 日${n.getHours() < 10 ? "0" + n.getHours() : n.getHours()} 时</span></li>
                    <li><span>当前位置</span><span>${Math.floor(data.lon * 100) / 100} / ${Math.floor(data.lat * 100) / 100}</span></li>             
                    
                    <li><span>风力</span><span>${getVelLevel(data.ws)} 级</span></li>
                    <li><span>风速</span><span>${Math.floor(data.ws * 100) / 100} m/s</span></li>
                    <li><span>中心气压</span><span>${Math.floor(data.ps * 100) / 100} hpa</span></li>
                    <li><span>六级风圈</span><span>${data.rr06 ? Math.floor(data.rr06 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>七级风圈</span><span>${data.rr07 ? Math.floor(data.rr07 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>八级风圈</span><span>${data.rr08 ? Math.floor(data.rr08 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>十级风圈</span><span>${data.rr10 ? Math.floor(data.rr10 * 100) / 100 + ' km' : "无"}</span></li>
                </ul>
                <div class="bgLeft">
                    <div class="bgLeftInt"></div>
                </div>
                </section>`);
            } else {
                // n = new Date(data.datetime);
                n = new Date(data.time.replace(/\-/g, "/"));
                // 修正为北京时间并加上预报时间
                // n.setHours(n.getHours() + 8 + data.leadtime);
                return L.popup({
                    className: 'ty-popup',
                    closeButton: false
                }).setContent(`<section class="typhoon-popup">
                <ul>
                  <li><span>${tyName}</span></li>
                   <li><span>时间</span><span>${n.getMonth()+1} 月${n.getDate()} 日${n.getHours() < 10 ? "0" + n.getHours() : n.getHours()} 时</span></li>
                    <li><span>预计位置</span><span>${Math.floor(data.lon * 100) / 100} / ${Math.floor(data.lat * 100) / 100}</span></li>         
                    
                    <li><span>风力</span><span>${getVelLevel(data.ws)} 级</span></li>
                    <li><span>风速</span><span>${Math.floor(data.ws * 100) / 100} m/s</span></li>
                    <li><span>中心气压</span><span>${Math.floor(data.ps * 100) / 100} hpa</span></li>
                    <li><span>六级风圈</span><span>${data.rr06 ? Math.floor(data.rr06 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>七级风圈</span><span>${data.rr07 ? Math.floor(data.rr07 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>八级风圈</span><span>${data.rr08 ? Math.floor(data.rr08 * 100) / 100 + ' km' : "无"}</span></li>
                    <li><span>十级风圈</span><span>${data.rr10 ? Math.floor(data.rr10 * 100) / 100 + ' km' : "无"}</span></li>
                </ul>
                 <div class="bgLeft">
                    <div class="bgLeftInt"></div>
                </div>
                </section>`);
            }
        }

        function getRankByLevel(level) {
            let v = level.trim()
            switch (v) {
                case 'TD':
                    return '热带低压'
                case 'TS':
                    return '热带风暴'
                case 'STS':
                    return '强热带风暴'
                case 'TY':
                    return '台风'
                case 'STY':
                    return '强台风'
                case 'SUPER':
                    return '超强台风'
            }
        }

        function getColorByLevel(level, outline = false) {
            if(!level) return '#aaea90'
            let v = level.trim()
            if (!outline) {
                switch (v) {
                    case 'TD':
                        return '#aaea90'
                    case 'TS':
                        return '#85b5e3'
                    case 'STS':
                        return '#e9eb4c'
                    case 'TY':
                        return '#fbc31a'
                    case 'STY':
                        return '#ed3f3f'
                    case 'SUPER':
                        return '#814d0f'
                    default:
                        return '#aaea90'
                }
            }
            if (outline == true) {
                switch (v) {
                    case 'TD':
                        return '#5c7e4e'
                    case 'TS':
                        return '#4b6680'
                    case 'STS':
                        return '#7e8029'
                    case 'TY':
                        return '#80630d'
                    case 'STY':
                        return '#802222'
                    case 'SUPER':
                        return '#503009'
                    default:
                    return '#5c7e4e'
                }
            }
        }

        function getSidePoints(lon1, lat1, lon2, lat2, r) {
            var dltLon = lon2 - lon1;
            var dltLat = lat2 - lat1;
            var dltLon2 = dltLon * dltLon;
            var dltLat2 = dltLat * dltLat;
            var dis1 = Math.sqrt(dltLon2 + dltLat2);
            var dis2 = r / 100.0;
            return {
                left: {
                    lat: (dltLon * dis1 * dis2 + lat2 * dltLon2 + dltLat2 * lat2) / (dltLon2 + dltLat2),
                    lon: (dltLon2 * lon2 + dltLat2 * lon2 - dis1 * dis2 * dltLat) / (dltLon2 + dltLat2)
                },
                right: {
                    lat: (-dltLon * dis1 * dis2 + lat2 * dltLon2 + dltLat2 * lat2) / (dltLon2 + dltLat2),
                    lon: (dltLon2 * lon2 + dltLat2 * lon2 + dis1 * dis2 * dltLat) / (dltLon2 + dltLat2)
                }
            }
        }

        function getFstR(value) {
            const tanDis = {
                6: 3 * 8,
                12: 6 * 8,
                18: 10 * 8,
                24: 14 * 8,
                36: 19 * 8,
                48: 24 * 8,
                60: 30 * 8,
                72: 32 * 8,
                84: 40 * 8,
                96: 42 * 8,
                108: 48 * 8,
                120: 50 * 8
            }
            return tanDis[value]
        }

        function getHalfPoints(left, right, num, latJuge) {
            var pois: any = [];
            var c = {
                lon: (left.lon + right.lon) / 2,
                lat: (left.lat + right.lat) / 2
            };
            var r = Math.sqrt((left.lon - right.lon) * (left.lon - right.lon) + (left.lat - right.lat) * (left.lat - right.lat)) / 2;
            var start = Math.atan((left.lon - c.lon) / (left.lat - c.lat));
            var dis = Math.PI;
            var step = dis / num;
            if (!latJuge) {
                for (var i = 1; i < num; i++) {
                    var angle = start - i * step;
                    pois.push(c.lon + r * Math.sin(angle), c.lat + r * Math.cos(angle))
                }
            }
            if (latJuge) {
                for (var i = 1; i < num; i++) {
                    var angle = start + i * step;
                    pois.push(c.lon + r * Math.sin(angle), c.lat + r * Math.cos(angle))
                }
            }
            return pois;
        }

        function getWindCircle(point) {
            let temp: any = {};
            if (point.rr06) {
                temp.rr06 = point.rr06;
            }
            if (point.rr07) {
                temp.rr07 = point.rr07;
            }
            if (point.rr08) {
                temp.rr08 = point.rr08;
            }
            if (point.rr10) {
                temp.rr10 = point.rr10;
            }
            return temp;
        }

        function getWindColor(level) {
            switch (level) {
                case 'rr06':
                    return '#15fe16';
                case 'rr07':
                    return '#181dfd';
                case 'rr08':
                    return '#f5fa17';
                case 'rr10':
                    return '#fe0406';
            }
        }

        function getWindCirclePoint(lon, lat, r) {
            let points: any = [],
                angle = 360;
            const dis = Math.PI;
            const R = r / 100;
            for (let i = 0; i < 360; i++) {
                points.push([
                    lat + R * Math.sin(i * dis / 180),
                    lon + R * Math.cos(i * dis / 180)
                ])
            }
            return points;
        }

        function getCurMKByLevel(lastPoint) {
            const v = lastPoint.level.trim();
            switch (v) {
                case 'TD':
                    return 'static/img/typhoon/TD.png'
                case 'TS':
                    return 'static/img/typhoon/TS.png'
                case 'STS':
                    return 'static/img/typhoon/STS.png'
                case 'TY':
                    return 'static/img/typhoon/TY.png'
                case 'STY':
                    return 'static/img/typhoon/STY.png'
                case 'SUPER':
                    return 'static/img/typhoon/SUPER.png'
                default:
                    return 'static/img/typhoon/TD.png'
            }
        }

        function computeDistance(lng1, lat1, lng2, lat2): any {
            var EARTH_RADIUS = 6378.137;
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = EARTH_RADIUS * s;
            s = Math.round(s * 10000) / 10000;
            return s.toFixed(1);
        };

        function getDateDiff(startTime, endTime, diffType) {
            //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
            startTime = startTime.replace(/\-/g, "/");
            endTime = endTime.replace(/\-/g, "/");
            //将计算间隔类性字符转换为小写
            diffType = diffType.toLowerCase();
            var sTime = new Date(startTime); //开始时间
            var eTime = new Date(endTime); //结束时间
            //作为除数的数字
            var divNum: any = 1;
            switch (diffType) {
                case "s":
                    divNum = 1000;
                    break;
                case "m":
                    divNum = 1000 * 60;
                    break;
                case "h":
                    divNum = 1000 * 3600;
                    break;
                case "d":
                    divNum = 1000 * 3600 * 24;
                    break;
                default:
                    divNum = 1000 * 3600;
                    break;
            }
            let diff: any = (eTime.getTime() - sTime.getTime()) / parseInt(divNum)
            diff = parseInt(diff)
            return diff;
        }

        function getCurvePoints(points, tension, numOfSeg, close) {
            if (typeof points === "undefined" || points.length < 2) return new Float32Array(0);
            // options or defaults
            tension = typeof tension === "number" ? tension : 0.5;
            numOfSeg = typeof numOfSeg === "number" ? numOfSeg : 25;
            var pts, // for cloning point array
                i = 1,
                l = points.length,
                rPos = 0,
                rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0),
                res = new Float32Array(rLen),
                cache = new Float32Array((numOfSeg + 2) << 2),
                cachePtr = 4;
            pts = points.slice(0);
            if (close) {
                pts.unshift(points[l - 1]); // insert end point as first point
                pts.unshift(points[l - 2]);
                pts.push(points[0], points[1]); // first point as last point
            } else {
                pts.unshift(points[1]); // copy 1. point and insert at beginning
                pts.unshift(points[0]);
                pts.push(points[l - 2], points[l - 1]); // duplicate end-points
            }
            // cache inner-loop calculations as they are based on t alone
            cache[0] = 1; // 1,0,0,0
            for (; i < numOfSeg; i++) {
                var st = i / numOfSeg,
                    st2 = st * st,
                    st3 = st2 * st,
                    st23 = st3 * 2,
                    st32 = st2 * 3;
                cache[cachePtr++] = st23 - st32 + 1; // c1
                cache[cachePtr++] = st32 - st23; // c2
                cache[cachePtr++] = st3 - 2 * st2 + st; // c3
                cache[cachePtr++] = st3 - st2; // c4
            }
            cache[++cachePtr] = 1; // 0,1,0,0
            // calc. points
            parse(pts, cache, l, tension);
            if (close) {
                //l = points.length;
                pts = [];
                pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1], // second last and last
                    points[0], points[1], points[2], points[3]); // first and second
                parse(pts, cache, 4, tension);
            }

            function parse(pts, cache, l, tension) {
                for (var i = 2, t; i < l; i += 2) {
                    var pt1 = pts[i],
                        pt2 = pts[i + 1],
                        pt3 = pts[i + 2],
                        pt4 = pts[i + 3],
                        t1x = (pt3 - pts[i - 2]) * tension,
                        t1y = (pt4 - pts[i - 1]) * tension,
                        t2x = (pts[i + 4] - pt1) * tension,
                        t2y = (pts[i + 5] - pt2) * tension,
                        c = 0,
                        c1, c2, c3, c4;
                    for (t = 0; t < numOfSeg; t++) {
                        c1 = cache[c++];
                        c2 = cache[c++];
                        c3 = cache[c++];
                        c4 = cache[c++];
                        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
                    }
                }
            }
            // add last point
            l = close ? 0 : points.length - 2;
            res[rPos++] = points[l++];
            res[rPos] = points[l];
            return res
        }

        function getVelLevel(vel) {
            //             0   1   2   3   4   5    6    7    8    9    10   11   12   13   14   15   16   17   18   19
            var levels = [0.3,1.6,3.4,5.5,8.0,10.8,13.9,17.2,20.8,24.5,28.5,32.7,37.0,41.5,46.2,51.0,56.1,61.3,66.8,72.4];
            // let levels = [0.5,2.6,4.6,6.6,8.6,10.5,12.5,14.5,16.5,18.5,20.5,22.5,24.5,26.5,28.5,30.5,32.5,34.5,36.5,38.6];
            for (let i = 0; i < levels.length; i++){
                if (vel<levels[i])
                    return i;
            }
            return 20;
        }

        return {
          realLastPoint,
          tyLayerGroup,
          layersGoesBack,
          tsid:tyData.tsid
        };
    }
}
