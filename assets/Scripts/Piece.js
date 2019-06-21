
cc.Class({
    extends : cc.Component,
    properties:{
        blocks: [], //node
        positionPiecesArea: cc.v2(0,0),     //anchor to first block in array ( [0] )
        positionInGameBoard: cc.v2(9999,9999),
        outLine:{
            default: null,
            type: cc.Prefab
        },
        outLines: [],
    },

    onLoad(){
        this.canRotate = false;
        this.sub = cc.v2(0,0);
        this.positionInGameBoard = cc.v2(9999,9999);
    },

    clear(){
        for(let block of this.blocks){
            block.destroy();
        }
        for(let outline of this.outLines){
            outline.destroy();
        }
        this.outLines.length = 0;
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
         //create outline for piece
        let outline = cc.instantiate(this.outLine);
        outline.position = block.position;
        let size = block.getContentSize();
        let ratio = window.gamePlay.widthOutLineHexagon;
        outline.setContentSize(size.width*ratio, size.height*ratio);
        this.node.addChild(outline, 0);
        this.outLines.push(outline);
    },

    moveBy(offset){
        window.gamePlay.actionHandler.scalePiece(this, 1);
        this.node.position = this.node.position.add(offset);
        this.node.zIndex = 10;
        this.setOutLine(true); 
    },

    setBlockIsHold(value){
        this.blocks.forEach(block =>{
            let com = block.getComponent('Block');
            if(com)com.isHold = value;
        });
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
            let sub = cc.v2(0,0).sub(this.blocks[0].position);
            sub = cc.v2(sub).rotate(cc.misc.degreesToRadians(this.node.angle));
            offset = offset.add(sub);
        }else{
            offset = this.positionPiecesArea;
            window.gamePlay.releasePieceFromHexagon(this);   
            actionHandler.scalePiece(this, actionHandler.selectionScale);
        }

        // calculate coord 
        
        if(immediate){
            this.node.position = offset;
            this.node.zIndex = 1;
        }else{
            this.node.runAction(cc.sequence(cc.moveTo(duration, offset), cc.callFunc(()=>{
                this.node.zIndex = 1;
            }, this)));
        }    

        this.setOutLine(false); 
    },

    setOutLine(value){
        this.outLines.forEach(o => o.active = value);
    }
})