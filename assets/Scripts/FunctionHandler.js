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
        numberHint: 1,
        countHintNode: cc.Node,
        autoes: [],
        isAutoPlay: false,
        isHint :false,
    },

    onLoad(){
        this.countHintLabel = this.countHintNode.getComponent(cc.Label);
        this.countHintLabel.string = this.numberHint;
    },

    preStart(){
        window.gamePlay.saveMgr.saveData(null, null, this.numberHint);
        this.countHintLabel.string = this.numberHint;
    },

    update(dt){
        if(this.isAutoPlay){
            let time = 0.5;
            let incre = 0.5;
            for(let auto of this.autoes){
                if(auto.piece && auto.piece.blocks.length > 0 && auto.piece.node.getNumberOfRunningActions() == 0){
                    window.gamePlay.actionHandler.stopShowCanRotate(auto.piece);
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

    nextLevel(){
        window.gamePlay.reset();
    },

    undo(){
        if(this.history.length > 0 && !window.gamePlay.isWin){
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
        if(window.gamePlay.isWin)return;
        let listHexagon = window.gamePlay.listHexagonsGroup[0];
        this.history.length = 0;
        for(let piece of listHexagon.pieces){
            piece.positionInGameBoard.x = 9999;
            piece.revertToPieces();
        }
       
        // window.gamePlay.reset();
    },

    hint(){
        if(window.gamePlay.isWin || this.numberHint <= 0 || this.hints.length <= 0)return;

        window.gamePlay.hideAllShadow(false);
        let numberPieces = 0;
        for(let group of window.gamePlay.listHexagonsGroup) numberPieces += group.pieces.length;
        let rate = Math.round(numberPieces / 100 * this.hintRate);
        for(let i = this.hints.length - 1; i > 0; i--){
            let j = ~~(Math.random() * (i + 1));
            [this.hints[i], this.hints[j]] = [this.hints[j], this.hints[i]];
        }
        while(rate > 0){
            let frame = this.hints[0].frame;
            for(let i = 0; i < this.hints.length;){
                let hint = this.hints[i];
                if(hint.frame.name == frame.name){
                    // hint.hexagon.setShadow(hint.frame);
                    hint.hexagon.setHint(hint.frame);
                    this.hints.splice(i, 1);
                }else i++;
            }
            --rate;
        }
        this.isHint = true;
        this.numberHint--;
        //set count
        this.countHintLabel.string = this.numberHint;
        window.gamePlay.saveMgr.saveData(null, null, this.numberHint);
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
