import {ActionHandler} from 'ActionHandler.js';

cc.Class({
    extends : cc.Component,
    properties:{
        blocks: [], //node
        positionPiecesArea: cc.v2(0,0),     //anchor to first block in array ( [0] )
        positionInGameBoard: cc.v2(9999,9999),
    },

    onLoad(){
        this.sub = cc.v2(0,0);
        this.positionInGameBoard = cc.v2(9999,9999);
    },

    pushBlock(block){
        if(this.blocks.length == 0){
            this.node.position = block.position.clone();
            this.sub = block.position.clone();
            block.position = cc.v2(0,0);
        }else{
            block.position =  block.position.sub(this.sub);
        }
        block.removeFromParent(false);
        this.node.addChild(block);
        this.blocks.push(block);
        let blockCom = block.getComponent('Block');
        blockCom.piece = this;
    },

    moveBy(offset){
        ActionHandler.instance.scalePiece(this, 1);
        this.node.position = this.node.position.add(offset);
        this.node.zIndex = 10;
    },

    setZindexAll(value){
        this.blocks.forEach(block =>{
            block.zIndex = value;
        });
    },

    revertToPieces(duration, immediate){
        let offset = cc.v2(0,0);
        if(this.positionInGameBoard.x != 9999)
        {
            offset = this.positionInGameBoard;
        }else{
            offset = this.positionPiecesArea;
            ActionHandler.instance.scalePiece(this, 0.5);
        }
        if(immediate){
            this.node.position = offset;
            this.node.zIndex = 0;
        }else{
            this.node.runAction(cc.sequence(cc.moveTo(duration, offset), cc.callFunc(()=>{
                this.node.zIndex = 0;
            }, this)));
        }    
    },

})