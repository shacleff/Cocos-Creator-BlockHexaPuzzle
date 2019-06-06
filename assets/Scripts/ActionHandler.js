// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export var ActionHandler = cc.Class({
    extends: cc.Component,

    properties: {
        selectionScale : 0.5,
        angleRotate : 120
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    scaleAllPiece(value){
        window.gamePlay.listHexagonsGroup.forEach(group=>{
            group.pieces.forEach(piece =>{
                this.scalePiece(piece, value)
            }, this)
        }, this);
    },

    scalePiece(piece, value){
        piece.node.scale = value;
    },

    rotatePiece(piece){
        if(piece.canRotate){
            piece.stopShowCanRotate(this.angleRotate);
            piece.showCanRotate();
            piece.blocks.forEach(block=>{
                block.angle -= this.angleRotate;
                if(block.angle < 0)block.angle += 360;
            });
            if(piece.node.angle >= 360)piece.node.angle = 0;
        }
    },

});


