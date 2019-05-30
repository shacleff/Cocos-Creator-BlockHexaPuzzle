export var Piece = cc.Class({
    name : "Piece",
    properties:{
        blocks: [], //node
        positionPiecesArea: cc.v2(0,0),     //anchor to first block in array ( [0] )
        positionInGameBoard: cc.v2(9999,9999),
    },

    onLoad(){
        this.positionInGameBoard = cc.v2(9999,9999);
    },

    pushBlock(block){
        this.blocks.push(block);
        let blockCom = block.getComponent('Block');
        blockCom.piece = this;
    },

    moveBy(offset){
        this.blocks.forEach(block =>{
            block.x += offset.x;
            block.y += offset.y;
            block.zIndex = 10;
        }, this);
    },

    setZindexAll(value){
        this.blocks.forEach(block =>{
            block.zIndex = value;
        });
    },

    revertToPieces(duration){
        let offset = cc.v2(0,0);
        if(this.positionInGameBoard.x != 9999)
        {
            offset = this.positionInGameBoard.sub(this.blocks[0].position);
        }else{
            offset = this.positionPiecesArea.sub(this.blocks[0].position);
        }
        this.blocks.forEach(block=>{
            block.runAction(cc.sequence(cc.moveBy(duration, offset), cc.callFunc(()=>{
                block.zIndex = 0;
            }, this)));
        }, this);
    },

})