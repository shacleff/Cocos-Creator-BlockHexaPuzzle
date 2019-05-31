// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

function History(piece, position){
    this.piece = piece;
    this.position = position;
} 

cc.Class({
    extends: cc.Component,

    properties: {
        history: [],    //History array
    },

    undo(){
        if(this.history.length > 0){
            let lastest = this.history[this.history.length - 1];
            if(lastest.piece.positionInGameBoard.x == 9999){
                lastest.piece.positionInGameBoard = lastest.position;
            }else{
                lastest.piece.positionInGameBoard.x = 9999;
            }
            lastest.piece.revertToPieces(0.1, false);
            this.history.pop();
        }
    },

    refresh(){
        this.history.length = 0;
        window.gamePlay.reset();
    },

    hint(){
        
    },

    saveHistory(piece, position){
        this.history.push(new History(piece, position));
    },
});
