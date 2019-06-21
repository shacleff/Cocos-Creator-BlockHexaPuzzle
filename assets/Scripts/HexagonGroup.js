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
        hexagons: [],    //Hexagon object array
        pieces: []  //Piece objects
    },

    onLoad () {
    },

    onDestroy(){
        console.log("destroy")
        
    },

    animateDestroy(){
        let ah = window.gamePlay.actionHandler;
        for(let piece of this.pieces)
            for(let block of piece.blocks) ah.destroyAnimation(block);
    },

    clear(){
        for(let hexa of this.hexagons){
            hexa.clear();
            hexa.node.destroy();
        }
        this.pieces.forEach(p => p.node.destroy());
        this.hexagons.length = 0;
        this.pieces.length = 0;
    },

    getHexagonAt(row, column){
        return this.hexagons.find(element =>{
            return element.row == row && element.column == column;
        }, this);
    },
    //@Param : type : cc.SpriteFrame,
    getPiece(type){
        for(let piece of this.pieces){
            if(piece.blocks.length > 0){
                let sprite = piece.blocks[0].getComponent(cc.Sprite)
                if(sprite){
                    let frame = sprite.spriteFrame;
                    if(frame && frame.isValid && frame.name == type.name)
                        return piece;
                }
            }
        }
        return null;
    },
    //@Param : type : cc.SpriteFrame,
    releaseBlockOnHexa(type){
        this.hexagons.forEach(hexagon =>{
            if(hexagon.block){
                let sprite = hexagon.block.getComponent(cc.Sprite);
                if(sprite){
                    let frame = sprite.spriteFrame;
                    if(frame && frame.isValid && frame.name == type.name)
                        hexagon.block = null;
                }
            }
        });
    },

    moveBy(offset){
        this.hexagons.forEach(element => {
            let curPos = element.node.getPosition();
            element.node.setPosition(curPos.x + offset.x, curPos.y + offset.y); 
        }, this);
    },

    push(hexagon){
        if(hexagon instanceof cc.Node){
            let hexagonCom = hexagon.getComponent('Hexagon');
            this.hexagons.push(hexagonCom);
        }
        else 
            cc.log("push wrong hexagon!");
    },

    getNumberHexagons(){
        return this.hexagons.length;
    }
});
