import generateForm from './generateForm.js'
import CONFIG from './setting.js'

let canvasCollection = []

generateForm('code-generator')

const image = document.getElementById('srcImg')
const srcCanvas = document.getElementById('srcCanvas')
const srcContext = srcCanvas.getContext('2d')
const recCanvas = document.getElementById('recCanvas')
const fileInput = document.getElementById('fileInput')

// 読み込み画像を表示
const displayImage = (event) => {
  let files
  const reader = new FileReader()
  if(event.target.files){
    files = event.target.files
  }else{
    files = event.dataTransfer.files
  }
  reader.addEventListener('load', () => {
    image.addEventListener('load', () => {
      srcCanvas.width  = image.width + CONFIG.CANVAS_PADDING.HORIZONTAL * 2
      srcCanvas.height = image.height + CONFIG.CANVAS_PADDING.VERTICAL * 2
      srcContext.fillStyle = CONFIG.CANVAS_PADDING.COLOR
      srcContext.fillRect(0, 0, srcCanvas.width, srcCanvas.height)
      // キャンバスに画像を描画
      srcContext.drawImage(
        image,
        CONFIG.CANVAS_PADDING.HORIZONTAL,
        CONFIG.CANVAS_PADDING.VERTICAL
      )
    })
    image.addEventListener('error', () => {
      alert('このファイルは読み込めません。')
    })
    image.src = reader.result
    image.style.display = 'none'
  })
  if (files[0]){
    reader.readAsDataURL(files[0])
    fileInput.value = ''
  }
}
fileInput.addEventListener('change', (event) => displayImage(event))
    // 矩形選択範囲を取得
    const getRectSelection = () => {
      let rect_MousedownFlg = false;
      let rect_sx = 0;
      let rect_sy = 0;
      let rect_ex = 0;
      let rect_ey = 0;
      srcCanvas.addEventListener('mousedown', (event) => {
        rect_MousedownFlg = true
        // 座標を求める
        const rect = event.target.getBoundingClientRect()
        rect_sx = rect_ex = event.clientX - rect.left
        rect_sy = rect_ey = event.clientY - rect.top
        // 色の反転
        function getTurningAround(color) {
          // 灰色は白にする
          if(color >= 88 && color <= 168) {
            return 255
          // 色を反転する
          } else {
            return 255 - color
          }
        }
        // 矩形の枠色を反転させる
        const imagedata = srcContext.getImageData(rect_sx, rect_sy, 1, 1)
        srcContext.strokeStyle =
          `rgb(
            ${getTurningAround(imagedata.data[0])},
            ${getTurningAround(imagedata.data[1])},
            ${getTurningAround(imagedata.data[2])}
          )`
        // 線の太さ
        srcContext.lineWidth = 2
        // 矩形の枠線を点線にする
        srcContext.setLineDash([2, 3])
      })
      srcCanvas.addEventListener('mousemove', (event) => {
        if(rect_MousedownFlg){
          // 座標を求める
          const rect = event.target.getBoundingClientRect()
          rect_ex = event.clientX - rect.left
          rect_ey = event.clientY - rect.top
          srcContext.fillRect(0, 0, srcCanvas.width, srcCanvas.height)
          // 元画像の再描画
          srcContext.drawImage(
            image,
            CONFIG.CANVAS_PADDING.HORIZONTAL,
            CONFIG.CANVAS_PADDING.VERTICAL
            )
          // 矩形の描画
          srcContext.beginPath()
          // 上
          srcContext.moveTo(rect_sx,rect_sy)
          srcContext.lineTo(rect_ex,rect_sy)
          // 下
          srcContext.moveTo(rect_sx,rect_ey)
          srcContext.lineTo(rect_ex,rect_ey)
          // 右
          srcContext.moveTo(rect_ex,rect_sy)
          srcContext.lineTo(rect_ex,rect_ey)
          // 左
          srcContext.moveTo(rect_sx,rect_sy)
          srcContext.lineTo(rect_sx,rect_ey)
          srcContext.stroke()
        }
      })
      srcCanvas.addEventListener('mouseup', () => {
        const recMaxWidth = srcCanvas.width - (CONFIG.CANVAS_PADDING.HORIZONTAL * 2)
        const recMaxHeight = srcCanvas.height - (CONFIG.CANVAS_PADDING.HORIZONTAL * 2)
        let ignoreArea = {}
        // 矩形のサイズ
        if(rect_MousedownFlg) {
          // 初期化
          const srcCanvasInit = () => {
            srcContext.fillRect(0, 0, srcCanvas.width, srcCanvas.height)
            // キャンバスに画像を描画
            srcContext.drawImage(
              image,
              CONFIG.CANVAS_PADDING.HORIZONTAL,
              CONFIG.CANVAS_PADDING.VERTICAL
              )
            rect_sx = rect_ex = 0
            rect_sy = rect_ey = 0
          }
          const buffer_rect = {
            start_x: rect_sx,
            end_x: rect_ex,
            start_y: rect_sy,
            end_y: rect_ey,
          }
          // 逆方向から選択範囲しても同じ領域を選択する
          if(rect_sx >= rect_ex) {
            rect_sx = buffer_rect.end_x
            rect_ex = buffer_rect.start_x
          }
          if(rect_sy >= rect_ey) {
            rect_sy = buffer_rect.end_y
            rect_ey = buffer_rect.start_y
          }
          const recMin_X = CONFIG.CANVAS_PADDING.HORIZONTAL
          const recMax_X = srcCanvas.width - CONFIG.CANVAS_PADDING.HORIZONTAL
          const recMin_Y = CONFIG.CANVAS_PADDING.VERTICAL
          const recMax_Y = srcCanvas.height - CONFIG.CANVAS_PADDING.VERTICAL
          ignoreArea.all = rect_sx <= recMin_X && rect_ex <= recMin_X ||
                           rect_sx >= recMax_X && rect_ex >= recMax_X ||
                           rect_sy <= recMin_Y && rect_ey <= recMin_Y ||
                           rect_sy >= recMax_Y && rect_ey >= recMax_Y
          // 選択範囲がパディング領域の場合は無効にする
          if(ignoreArea.all) {
            srcCanvasInit()
            recCanvas.width = 0
            recCanvas.height = 0
          } else {
            const selectedWidth = Math.abs(rect_sx - rect_ex)
            const selectedHeight = Math.abs(rect_sy - rect_ey)
            ignoreArea.left = (rect_sx <= recMin_X ? recMin_X - rect_sx : 0)
            ignoreArea.right = (rect_ex >= recMax_X ? rect_ex - recMax_X : 0)
            ignoreArea.top = (rect_sy <= recMin_Y ? recMin_Y - rect_sy : 0)
            ignoreArea.bottom = (rect_ey >= recMax_Y ? rect_ey - recMax_Y : 0)
            if(ignoreArea.left && ignoreArea.right) {
              recCanvas.width = recMaxWidth
              recCanvas.style.left = `${recMin_X}px`
            } else if(ignoreArea.left && !ignoreArea.right) {
              recCanvas.width = selectedWidth - (recMin_X - rect_sx)
              recCanvas.style.left = `${recMin_X}px`
            } else if(!ignoreArea.left && ignoreArea.right) {
              recCanvas.width = selectedWidth - (rect_ex - recMax_X)
              recCanvas.style.left = (rect_sx <= rect_ex ? `${rect_sx}px` : `${rect_ex}px`)
            } else if(!ignoreArea.left && !ignoreArea.right) {
              recCanvas.width = selectedWidth
              recCanvas.style.left = (rect_sx <= rect_ex ? `${rect_sx}px` : `${rect_ex}px`)
            }
            if(ignoreArea.top && ignoreArea.bottom) {
              recCanvas.height = recMaxHeight
              recCanvas.style.top = `${Math.round(recMin_Y)}px`
            } else if(ignoreArea.top && !ignoreArea.bottom) {
              recCanvas.height = selectedHeight - (recMin_Y - rect_sy)
              recCanvas.style.top = `${Math.round(recMin_Y)}px`
            } else if(!ignoreArea.top && ignoreArea.bottom) {
              recCanvas.height = selectedHeight - (rect_ey - recMax_Y)
              recCanvas.style.top = `${Math.round(rect_sy)}px`
            } else if(!ignoreArea.top && !ignoreArea.bottom) {
              recCanvas.height = selectedHeight
              recCanvas.style.top = `${Math.round(rect_sy)}px`
            }
            recCanvas.style.backgroundColor = 'rgba(255, 255, 0, 0.5)'
            // 初期化
            srcCanvasInit()
            // 選択範囲内から要素を検出
            const targetAdsorber = (direction) => {
              const verticalArguments = ['toBottom', 'toTop']
              const horizontalArguments = ['toRight', 'toLeft']
              const allowArguments = verticalArguments.concat(horizontalArguments)
              if(allowArguments.includes(direction)) {
                let shallowLayerArray
                let deepLayerArray
                const recCanvasPoint_sx = Number(recCanvas.style.left.slice(0, -2))
                const recCanvasPoint_ex = recCanvasPoint_sx + Number(recCanvas.width - 1)
                const recCanvasPoint_sy = Number(recCanvas.style.top.slice(0, -2))
                const recCanvasPoint_ey = recCanvasPoint_sy + Number(recCanvas.height - 1)
                if(verticalArguments.includes(direction)) {
                  shallowLayerArray = new Array(recCanvas.height).fill(null)
                  deepLayerArray = new Array(recCanvas.width).fill(null)
                } else {
                  shallowLayerArray = new Array(recCanvas.width).fill(null)
                  deepLayerArray = new Array(recCanvas.height).fill(null)
                }
                let breakLine = 0
                let retouchColorsCollection = []
                shallowLayerArray.some((shallowElement, shallowIndex) => {
                  let shallowLayerPoint
                  if(verticalArguments.includes(direction)) {
                    shallowLayerPoint = (direction === 'toBottom' ? shallowIndex + recCanvasPoint_sy : recCanvasPoint_ey - shallowIndex)
                  } else {
                    shallowLayerPoint = (direction === 'toRight' ? shallowIndex + recCanvasPoint_sx : recCanvasPoint_ex - shallowIndex)
                  }
                  let originColors = []
                  let colorsBreakdown = []
                  deepLayerArray.forEach( (deepElement, deepIndex) => {
                    let deepLayerPoint
                    let currentPixelColor
                    if(verticalArguments.includes(direction)) {
                      deepLayerPoint = deepIndex + recCanvasPoint_sx
                      currentPixelColor = srcContext.getImageData(deepLayerPoint, shallowLayerPoint, 1, 1)
                    } else {
                      deepLayerPoint = deepIndex + recCanvasPoint_sy
                      currentPixelColor = srcContext.getImageData(shallowLayerPoint, deepLayerPoint, 1, 1)
                    }
                    // アルファ値を除いて処理する
                    const strColor = currentPixelColor.data.slice(0, 3).join(',')
                    const matchColorIndex = colorsBreakdown.indexOf(strColor)
                    let qty
                    if(deepIndex > 0) {
                      if(originColors.includes(strColor)) {
                        qty = colorsBreakdown[matchColorIndex + 1] + 1
                        colorsBreakdown[matchColorIndex + 1] = qty
                      } else {
                        qty = 1
                        colorsBreakdown.push(strColor)
                        colorsBreakdown.splice(colorsBreakdown.indexOf(strColor) + 1, 0, qty)
                      }
                    } else {
                      qty = 1
                      colorsBreakdown.push(strColor)
                      colorsBreakdown.splice(colorsBreakdown.indexOf(strColor) + 1, 0, qty)
                    }
                    originColors.push(strColor)
                    if(deepIndex >= deepLayerArray.length - 1) {
                      const retouchColors = [...originColors]
                      const calculatorToSum = (accumulator, currentValue) => accumulator + currentValue
                      if(colorsBreakdown.length > 2) {
                        const qtyData = colorsBreakdown.filter(element => typeof element === 'number' )
                        const maxQty = Math.max(...qtyData)
                        const maxQtyData = colorsBreakdown.filter(element => element === maxQty)
                        retouchColors.forEach( (retouchElement, retouchIndex) => {
                          maxQtyData.forEach( (qtyElement, qtyIndex) => {
                            const mainColor = colorsBreakdown[colorsBreakdown.indexOf(maxQty, qtyIndex + 1) - 1].split(',')
                            const sumMainColor = [...mainColor]
                            mainColor.forEach((rgb, rgbIndex) => {
                              sumMainColor[rgbIndex] = Number(rgb)
                            })
                            const retouchRowColor = retouchElement.split(',')
                            const sumRetouchColor = [...retouchRowColor]
                            retouchRowColor.forEach((rgb, rgbIndex) => {
                              sumRetouchColor[rgbIndex] = Number(rgb)
                            })
                            const colorDiff = Math.abs(sumMainColor.reduce(calculatorToSum) - sumRetouchColor.reduce(calculatorToSum))
                            if(colorDiff >= 0 && colorDiff <= CONFIG.COLOR_TOLERANCE) {
                              retouchColors[retouchIndex] = mainColor.join(',')
                            }
                          })
                        })
                      }
                      retouchColorsCollection.push(retouchColors)
                      if(shallowIndex > 0) {
                        let sameColorCounter = 0
                        retouchColors.forEach( (retouchElement, retouchIndex) => {
                          const prevLineColor = retouchColorsCollection[shallowIndex - 1][retouchIndex].split(',')
                          prevLineColor.forEach((rgb, rgbIndex) => {
                            prevLineColor[rgbIndex] = Number(rgb)
                          })
                          const currentLineColor = retouchColorsCollection[shallowIndex][retouchIndex].split(',')
                          currentLineColor.forEach((rgb, rgbIndex) => {
                            currentLineColor[rgbIndex] = Number(rgb)
                          })
                          const colorDiff = Math.abs(prevLineColor.reduce(calculatorToSum) - currentLineColor.reduce(calculatorToSum))
                          if(colorDiff <= CONFIG.COLOR_TOLERANCE) sameColorCounter++
                        })
                        if(1 > sameColorCounter / deepLayerArray.length) breakLine = shallowIndex
                      }
                    }
                  })
                  if(breakLine) {
                    if(direction === 'toBottom') recCanvas.style.top = `${recCanvasPoint_sy + breakLine}px`
                    if(direction === 'toRight') recCanvas.style.left = `${recCanvasPoint_sx + breakLine}px`
                    if(verticalArguments.includes(direction)) recCanvas.height = recCanvas.height - breakLine
                    if(horizontalArguments.includes(direction)) recCanvas.width = recCanvas.width - breakLine
                    return true
                  }
                })
              } else {
                console.error('Enabled arguments is only toBottom, toTop, toRight, toLeft.')
              }
            }
            if(ignoreArea.top && !ignoreArea.bottom) {
              targetAdsorber('toTop')
            } else if(!ignoreArea.top && ignoreArea.bottom) {
              targetAdsorber('toBottom')
            } else if(!ignoreArea.top && !ignoreArea.bottom) {
              targetAdsorber('toBottom')
              targetAdsorber('toTop')
            }
            if(ignoreArea.left && !ignoreArea.right) {
              targetAdsorber('toLeft')
            } else if(!ignoreArea.left && ignoreArea.right) {
              targetAdsorber('toRight')
            } else if(!ignoreArea.left && !ignoreArea.right) {
              targetAdsorber('toRight')
              targetAdsorber('toLeft')
            }
          }
        }
        class imageOutputer {
          constructor() {
            this.tag = 'canvas'
            this.width = recCanvas.width
            this.height = recCanvas.height
            this.sx = Number(recCanvas.style.left.slice(0, -2)) - CONFIG.CANVAS_PADDING.HORIZONTAL
            this.ex = Number(recCanvas.style.left.slice(0, -2)) + recCanvas.width
            this.sy = Number(recCanvas.style.top.slice(0, -2)) - CONFIG.CANVAS_PADDING.VERTICAL
            this.ey = Number(recCanvas.style.top.slice(0, -2)) + recCanvas.height
            this.style = recCanvas.style.cssText
          }
          imageCopyer = (targetCanvasId) => {
            const targetContext = document.getElementById(targetCanvasId).getContext('2d')
            targetContext.drawImage(image,
              this.sx,this.sy,
              this.width,this.height,
              0,0,this.width,this.height)
          }
          outputImage = (targetCanvasId, serialNumber) => {
            const targetCanvas = document.getElementById(targetCanvasId)
            const base64 = targetCanvas.toDataURL('image/jpeg', 1.0)
            const outputLink = document.getElementById('outputImg')
            outputLink.href = base64
            outputLink.download = `${sendPrefix.value}${CONFIG.PREFIX_CONNECTION}img${serialNumber}.jpg`
            outputLink.click()
          }
        }
        const currentCanvas = new imageOutputer(
          recCanvas.width,
          recCanvas.height,
          Number(recCanvas.style.left.slice(0, -2)),
          Number(recCanvas.style.left.slice(0, -2)) + recCanvas.width,
          Number(recCanvas.style.top.slice(0, -2)),
          Number(recCanvas.style.top.slice(0, -2)) + recCanvas.height,
          recCanvas.style.cssText
        )
        canvasCollection.push(currentCanvas)
        rect_MousedownFlg = false
      })
    }
    const coordinatesSorter = (targetArray, priorityPoint) => {
      if(!Array.isArray(targetArray)) {
        console.error('Enabled first arguments is only array type.')
        return
      }
      const allowArguments = ['x', 'y']
      if(!allowArguments.includes(priorityPoint)) {
        console.error('Enabled second arguments is only x or y.')
        return
      }
      let Sorted = [...targetArray]
      targetArray.forEach(() => {
        Sorted.sort((a, b) => {
          if(priorityPoint === 'x') {
            return a.sx - b.sx
          } else if(priorityPoint === 'y') {
            return a.sy - b.sy
          }
        })
      })
      const groupBy = (objectArray, property) => {
        return objectArray.reduce((accumulator, obj) => {
          let key = obj[property]
          if (!accumulator[key]) {
            accumulator[key] = []
          }
          accumulator[key].push(obj)
          if(accumulator[key].length >= 2) {
            accumulator[key].sort((a, b) => {
              if(priorityPoint === 'x') {
                return a.sy - b.sy
              } else if(priorityPoint === 'y') {
                return a.sx - b.sx
              }
            })
          }
          return accumulator
        }, {})
      }
      let groupedSame_y = groupBy(Sorted, 'sy')
      canvasCollection = []
      Object.keys(groupedSame_y).forEach((key) => {
        groupedSame_y[key].forEach((nestElement) => {
          canvasCollection.push(nestElement)
        })
      })
    }
    viewSelected.addEventListener('click', () => {
      coordinatesSorter(canvasCollection, 'y')
      canvasCollection.forEach((element, index) => {
        const selected = document.createElement('canvas')
        selected.id = `img-${index}`
        selected.className = `selected-img`
        selected.width = element.width
        selected.height = element.height
        selected.style = element.style
        canvasArea.append(selected)
      })
    })
    download.addEventListener('click', () => {
      coordinatesSorter(canvasCollection, 'y')
      canvasCollection.forEach((element, index) => {
        const selected = document.getElementById(`img-${index}`)
        element.imageCopyer(selected.id)
        element.outputImage(selected.id, index + 1)
      })
    })
    getRectSelection()
