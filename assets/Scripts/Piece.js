
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

    clear(){
        for(let block of this.blocks){
            block.destroy();
        }
        this.blocks.length = 0;
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
        window.gamePlay.actionHandler.scalePiece(this, 1);
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
        let funcHandler = window.gamePlay.node.getChildByName('FunctionHandler');
        let actionHandler = window.gamePlay.actionHandler;
        if(this.positionInGameBoard.x != 9999)
        {
            actionHandler.scalePiece(this, 1);
            offset = this.positionInGameBoard;
            if(funcHandler && !immediate){
                funcHandler.getComponent('FunctionHandler').saveHistory(this, offset);
            }
        }else{
            offset = this.positionPiecesArea;
            window.gamePlay.releasePieceFromHexagon(this);   
            actionHandler.scalePiece(this, actionHandler.selectionScale);
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