const up_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z"/></svg>`;
const down_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"/></svg>`;

const up_disabled_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#cccccc"><path d="M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z"/></svg>`;
const down_disabled_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#cccccc"><path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"/></svg>`
  
miro.onReady(async () => {
    const authorized = await miro.isAuthorized();
    if (!authorized) {
        return;
    }

    await miro.initialize({
      
        extensionPoints: {
            getWidgetMenuItems: async (widgets) => {
              if (!widgets || !widgets.length || widgets.length !== 1){
                return [];
              }
              const widget = widgets[0];
              const nearestWidgets = await findNearestWidgets(widget)
              
              const upClick = async (widgets) => {
                const uwidgets = await findNearestWidgets(widget)
                if (uwidgets.next !== false) {
                  await miro.board.figma.moveFront(widget, uwidgets.next);
                  if (nearestWidgets.prev === false || uwidgets.futureNext === false) {
                    await reselect(widget)
                  }
                }
                
                
              }
              
              const downClick = async (widgets) => {
                const dwidgets = await findNearestWidgets(widget)
                if (dwidgets.prev !== false) {
                  await miro.board.figma.moveBack(widget, dwidgets.prev);
                  if (nearestWidgets.next === false || dwidgets.futurePrev === false){
                    await reselect(widget)
                  }
                }
              }
              
                return [{
                    tooltip: 'Up',
                    svgIcon: nearestWidgets.next === false ? up_disabled_icon : up_icon,
                    onClick: nearestWidgets.next === false ? async () => {} : upClick
                }, {
                    tooltip: 'Down',
                    svgIcon: nearestWidgets.prev === false ? down_disabled_icon : down_icon,
                    onClick: nearestWidgets.prev === false ? async () => {} : downClick
                }];
            }
        }
    })
});

async function findNearestWidgets(widget){
  const defaultResult = { prev: false, next: false }
  if (!widget.bounds){
    return defaultResult;
  }
  let rect = boundsToRect(widget.bounds);
  let intersectedWidgets = await miro.board.widgets.__getIntersectedObjects(rect);
  intersectedWidgets = await miro.board.figma.sortWidgetsByZIndex(intersectedWidgets);
  for (var i = 0; i < intersectedWidgets.length; i++) {
    var iter = intersectedWidgets[i];
    if (iter.id === widget.id){
      return {
        futurePrev: i - 1 > 0 ? intersectedWidgets[i - 2] : false,
        prev: i > 0 ? intersectedWidgets[i - 1] : false,
        next: i + 1 < intersectedWidgets.length ? intersectedWidgets[i + 1] : false,
        futureNext: i + 2 < intersectedWidgets.length ? intersectedWidgets[i + 2] : false
      }
    }
  }
  return defaultResult;
}

function boundsToRect(bounds){
  return {
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height
  }
}

async function reselect(widget){
    if (!widget) {
        return
    }
    console.log('reselect');
    await miro.board.selection.clear();
    await miro.board.selection.selectWidgets(widget)
}
