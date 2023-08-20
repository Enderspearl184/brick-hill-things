let serverline = getModule('serverline')

serverline.init()
serverline.setPrompt('> ')
 
serverline.on('line', (line) => {
  try {
      let returnValue = eval(`(() => { ${line} })()`)
      if (returnValue)
        console.log(`Return Value: ${returnValue}`)
  } catch (err) {
      console.error(err)
  }
})