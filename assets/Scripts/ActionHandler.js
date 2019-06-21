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
        angleRotate : 120,
        timeToActiveTapRotate : 0.5,    //second unit
        showRotateAngleChange : 30,
        showRotateRepeattimes : 2,
        animationDestroyTime : 2
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

    destroyAnimation(block){
        let blockCom = block.getComponent('Block');
        if(blockCom)blockCom.piece = null;
        let x = RandomRange(-300, 300);
        let y = window.gamePlay.node.height / 2;
        block.runAction((
            // cc.repeatForever(cc.rotateBy(1, 250)),
            cc.sequence(
                cc.jumpBy(this.animationDestroyTime, cc.v2(x, -y), 500, 1), 
                cc.callFunc(()=>{
                    block.destroy();
                }, block))
        )) 
    },


    rotatePiece(piece){
        if(piece.canRotate){
            this.stopShowCanRotate(piece);
            this.showCanRotate(piece);
            piece.node.angle += this.angleRotate;
            piece.blocks.forEach(block=>{
                block.angle -= this.angleRotate;
                if(block.angle < 0)block.angle += 360;
            });
            if(piece.node.angle >= 360)piece.node.angle = 0;
        }
    },

    showCanRotate(piece){
        if(piece.canRotate){
            piece.node.runAction(cc.repeatForever(cc.sequence(
                cc.repeat(cc.sequence(
                    cc.rotateBy(0.2, this.showRotateAngleChange),
                    cc.rotateBy(0.2, -this.showRotateAngleChange)
                ), this.showRotateRepeattimes),
                cc.delayTime(2),
                cc.repeat(cc.sequence(
                    cc.rotateBy(0.2, -this.showRotateAngleChange),
                    cc.rotateBy(0.2, this.showRotateAngleChange)
                ), this.showRotateRepeattimes),
                cc.delayTime(2),
            )));
        }
        
    },

    stopShowCanRotate(piece){
        if(piece.canRotate){
            piece.node.stopAllActions();
            let n = (Math.round(Math.abs(piece.node.angle) / this.angleRotate)) % 3;
            piece.node.angle = this.angleRotate * n;
        }
    }

});


