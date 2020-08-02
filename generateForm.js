const generateForm = (destID) => {
  const dest = document.getElementById(destID)
  // 操作フォーム生成
  const operationArea = document.createElement('div')
  operationArea.id = 'operationArea'
  // ファイルアップロードボタン
  const fileInput = document.createElement('input')
  const acceptFormat = 'image/jpeg,image/png,image/gif,image/bmp,image/x-icon'
  fileInput.id = 'fileInput'
  fileInput.className = 'file-upload'
  fileInput.type = 'file'
  fileInput.accept = acceptFormat
  operationArea.append(fileInput)
  // プレフィックスインプット
  const sendPrefix = document.createElement('input')
  sendPrefix.id = 'sendPrefix'
  sendPrefix.className = 'code-build'
  sendPrefix.type = 'text'
  sendPrefix.placeholder = '画像のprefixを入力'
  operationArea.append(sendPrefix)
  dest.append(operationArea)
  // ビューボタン
  const viewSelected = document.createElement('button')
  viewSelected.id = 'viewSelected'
  viewSelected.className = 'code-build'
  viewSelected.textContent = 'view'
  operationArea.append(viewSelected)
  dest.append(operationArea)
  // ダウンロードボタン
  const download = document.createElement('button')
  download.id = 'download'
  download.className = 'code-build'
  download.textContent = 'DL'
  operationArea.append(download)
  dest.append(operationArea)
  // キャンバスエリア生成
  const canvasArea = document.createElement('div')
  canvasArea.id = 'canvasArea'
  canvasArea.style.position = 'relative'
  const srcImg = document.createElement('img')
  const outputImg = document.createElement('a')
  const srcCanvas = document.createElement('canvas')
  const recCanvas = document.createElement('canvas')
  srcImg.id = 'srcImg'
  outputImg.id = 'outputImg'
  srcCanvas.id = 'srcCanvas'
  recCanvas.id = 'recCanvas'
  srcCanvas.width = 0
  srcCanvas.height = 0
  srcCanvas.style.top = '0px'
  srcCanvas.style.left = '0px'
  recCanvas.width = 0
  recCanvas.height = 0
  recCanvas.style.position = 'absolute'
  recCanvas.style.top = '0px'
  recCanvas.style.left = '0px'
  canvasArea.append(srcImg)
  canvasArea.append(outputImg)
  canvasArea.append(srcCanvas)
  canvasArea.append(recCanvas)
  dest.append(canvasArea)
}

export default generateForm
