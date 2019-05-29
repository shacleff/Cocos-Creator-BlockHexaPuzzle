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

    moveBy(offset){
        this.blocks.forEach(block =>{
            block.x += offset.x;
            block.y += offset.y;
        }, this);
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
            block.runAction(cc.moveBy(duration, offset));
        }, this);
    },

})