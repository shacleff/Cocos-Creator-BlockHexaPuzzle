// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        piece: {
            default: null,
            visible: false
        },
        durationMove : 0.2
    },

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    },

    touchStart(event){
    },

    touchMove(event){
        if(this.piece){
            window.gamePlay.releasePieceFromHexagon(this.piece);
            // let touchLocation = event.touch.getLocation();
            // let canvansCenter = cc.v2(window.gamePlay.node.width / 2, window.gamePlay.node.height / 2);
            // touchLocation = touchLocation.sub(canvansCenter);
            // let offset = cc.v2(touchLocation.x - this.node.x, touchLocation.y - this.node.y);
            let offset = event.touch.getDelta();
            this.piece.moveBy(offset);

            let hexagonsAvaiable = window.gamePlay.isPieceFit(this.piece);
            window.gamePlay.hideAllShadow();
            if(hexagonsAvaiable.length == this.piece.blocks.length){
                window.gamePlay.setToNewHexagons(this.piece, hexagonsAvaiable);
            }else{
                this.piece.positionInGameBoard.x = 9999;
            }
        }
    },

    touchEnd(event){
        if(this.piece){
            let hexagonsAvaiable = window.gamePlay.isPieceFit(this.piece);
            if(hexagonsAvaiable.length == this.piece.blocks.length){
                window.gamePlay.setToNewHexagons(this.piece, hexagonsAvaiable);
            }
            this.piece.revertToPieces(this.durationMove);
        }
        window.gamePlay.hideAllShadow();
        console.log(this.piece.node.getContentSize());
    },
});
