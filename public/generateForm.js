class appUI {
  elementCreator = (tagName, compositionObject) => {
    const isHtmlTag = this.htmlTagCheck(tagName)
    if (!isHtmlTag) {
      console.error('Enabled first arguments is Only html tag.')
      return
    }
    const objectType = Object.prototype.toString
    if(objectType.call(compositionObject) !== '[object Object]') {
      console.error('Enabled second arguments is only object type.')
      return
    }
    const newElement = document.createElement(tagName)
    Object.keys(compositionObject).forEach((key) => {
      const splitKeys = key.split('.')
      if(splitKeys.length > 1) {
        switch(splitKeys.length) {
          case 2:
            newElement[splitKeys[0]][splitKeys[1]] = compositionObject[key]
            break
          case 3:
            newElement[splitKeys[0]][splitKeys[1]][splitKeys[2]] = compositionObject[key]
            break
          default:
            console.error('Maximum number of method chains exceeded.')
            return
        }
      } else {
        newElement[key] = compositionObject[key]
      }
    })
    return newElement
  }
  newElementAppender = (newElement, destID = 'code-generator') => {
    const dest = document.getElementById(destID)
    dest.append(newElement)
  }
  htmlTagCheck = (tag) => {
    const getElement = document.createElement(tag).constructor.name
    return getElement !== 'HTMLUnknownElement' ? true : false
  }
}

const app_ui = new appUI()

// 操作フォーム生成
app_ui.newElementAppender(app_ui.elementCreator('div', {
  'id': 'operationArea',
}))
// ファイルアップロードボタン
app_ui.newElementAppender(app_ui.elementCreator('input', {
  'id': 'fileInput',
  'className': 'file-upload',
  'type': 'file',
  'accept': 'image/jpeg,image/png,image/gif,image/bmp,image/x-icon',
}))
// プレフィックスインプット
app_ui.newElementAppender(app_ui.elementCreator('input', {
  'id': 'sendPrefix',
  'className': 'code-build',
  'type': 'text',
  'placeholder': '画像のprefixを入力',
}))
// ビューボタン
app_ui.newElementAppender(app_ui.elementCreator('button', {
  'id': 'viewSelected',
  'className': 'code-build',
  'textContent': 'view',
}))
// ダウンロードボタン
app_ui.newElementAppender(app_ui.elementCreator('button', {
  'id': 'download',
  'className': 'code-build',
  'textContent': 'DL',
}))
// キャンバスエリア生成
app_ui.newElementAppender(app_ui.elementCreator('div', {
  'id': 'canvasArea',
  'style.position': 'relative',
}))
// 画像読み込み用エリア
app_ui.newElementAppender(app_ui.elementCreator('img', {
  'id': 'srcImg',
}), 'canvasArea')
// 画像出力用エリア
app_ui.newElementAppender(app_ui.elementCreator('a', {
  'id': 'outputImg',
}), 'canvasArea')
// 編集エリア
app_ui.newElementAppender(app_ui.elementCreator('canvas', {
  'id': 'srcCanvas',
  'width': 0,
  'height': 0,
  'style.top': '0px',
  'style.left': '0px',
}), 'canvasArea')
// 編集結果エリア
app_ui.newElementAppender(app_ui.elementCreator('canvas', {
  'id': 'recCanvas',
  'width': 0,
  'height': 0,
  'style.position': 'absolute',
  'style.top': '0px',
  'style.left': '0px',
}), 'canvasArea')
