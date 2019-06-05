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
};

function Hint(hexagon, frame){
    this.hexagon = hexagon;
    this.frame = frame;
};

function Auto(piece, position){
    this.piece = piece;
    this.position = position;
};

cc.Class({
    extends: cc.Component,

    properties: {
        history: [],    //History array
        hints: [],
        hintRate : 30,
        autoes: [],
        isAutoPlay: false,
    },

    update(dt){
        if(this.isAutoPlay){
            let time = 0.5;
            let incre = 0.5;
            for(let auto of this.autoes){
                if(auto.piece && auto.piece.blocks.length > 0 && auto.piece.node.getNumberOfRunningActions() == 0){
                    auto.piece.node.runAction(cc.sequence(
                                                cc.delayTime(time), 
                                                cc.callFunc(()=>{auto.piece.moveBy(cc.v2(0,0));}),
                                                cc.moveTo(incre, auto.position),
                                                cc.callFunc(()=>{
                                                    auto.piece.blocks[0].getComponent('Block').touchEnd(0);
                                                }, this)));
                    time += incre;
                }
            }
        }
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
        window.gamePlay.hideAllShadow();
        let numberPieces = 0;
        for(let group of window.gamePlay.listHexagonsGroup) numberPieces += group.pieces.length;
        let rate = Math.round(numberPieces / 100 * this.hintRate);
        let tempHint = Array.from(this.hints);
        for(let i = tempHint.length - 1; i > 0; i--){
            let j = ~~(Math.random() * (i + 1));
            [tempHint[i], tempHint[j]] = [tempHint[j], tempHint[i]];
        }
        while(rate > 0){
            let frame = tempHint[0].frame;
            for(let i = 0; i < tempHint.length;){
                let hint = tempHint[i];
                if(hint.frame.name == frame.name){
                    hint.hexagon.setShadow(hint.frame);
                    tempHint.splice(i, 1);
                }else i++;
            }
            --rate;
        }
    },

    autoPlay(){
        this.isAutoPlay = !this.isAutoPlay;
    },

    saveAuto(piece, position){
        this.autoes.push(new Auto(piece, position));
    },

    saveHint(hexagon, frame){
        this.hints.push(new Hint(hexagon, frame));
    },

    saveHistory(piece, position){
        this.history.push(new History(piece, position));
    },

    
});
