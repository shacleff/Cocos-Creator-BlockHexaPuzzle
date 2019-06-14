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
        adsHintNode: cc.Node,
        autoes: [],
        isAutoPlay: false,
        isHint :false,
        numberHintAddedAfterAds: 3,
        timeSuggestUseHint: 10,
        suggestHintJumpHeight: 50,
        timeSuggest : 1,
        hintBtn:{
            default: null,
            type: cc.Node
        },
        hintAds:{
            default: null,
            type: cc.Prefab
        },
        quitPopup:{
            default: null,
            type: cc.Prefab
        },
        
    },

    onLoad(){
        this.countHintLabel = this.countHintNode.getComponent(cc.Label);
        this.countHintLabel.string = this.numberHint;
        if(this.numberHint <= 0)this.adsHintNode.active = true;
        else this.adsHintNode.active = false;
        this.countHintNode.active = !this.adsHintNode.active;
        this.isPaused = false;
        this.countSuggestHint = Date.now();
    },

    preStart(){
        window.gamePlay.saveMgr.saveData(null, null, this.numberHint);
        this.countHintLabel.string = this.numberHint;
        this.originHintBtnPos = this.hintBtn.position;
    },

    update(dt){
        if(this.isPaused)return;

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

        //suggest hint
        let time = Date.now();
        if(time - this.countSuggestHint >= this.timeSuggestUseHint * 1000 && this.hintBtn.getNumberOfRunningActions() == 0){
            this.suggestHint();
        }
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
            piece.revertToPieces(0.1, false);
        }
        this.offSuggestHint();
        // window.gamePlay.reset();
    },

    hint(){
        if(window.gamePlay.isWin)return;

        this.offSuggestHint();
        if(this.numberHint <= 0){
            this.ads = cc.instantiate(this.hintAds);
            this.ads.getComponent('AdsVideo').skipCallBack = (()=>{
                window.gamePlay.functionHandler.numberHint += this.numberHintAddedAfterAds;
                window.gamePlay.functionHandler.showHintNumber();
            });
            window.gamePlay.node.addChild(this.ads);
            return;
        }
        if(this.hints.length <= 0)return;

        window.gamePlay.hideAllShadow(false);
        let numberPieces = 0;
        for(let group of window.gamePlay.listHexagonsGroup) numberPieces += group.pieces.length;
        let rate = Math.round(numberPieces / 100 * this.hintRate);
        for(let i = this.hints.length - 1; i > 0; i--){
            let j = ~~(Math.random() * (i + 1));
            [this.hints[i], this.hints[j]] = [this.hints[j], this.hints[i]];
        }
        while(rate > 0){
            if(this.hints.length == 0)break;
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
        this.showHintNumber();
    },

    suggestHint(){
        if(this.hintBtn){
            this.hintBtn.runAction(cc.sequence(cc.jumpBy(0.4, cc.v2(0,0), this.suggestHintJumpHeight, 1), cc.delayTime(0.5)));
            if(this.timeSuggest > 0){
                this.hintBtn.runAction(cc.sequence(
                    cc.jumpBy(this.timeSuggest / 2, cc.v2(0,0), this.suggestHintJumpHeight, 2), 
                    cc.delayTime(this.timeSuggest / 2), 
                    cc.callFunc(()=>{this.countSuggestHint = Date.now();}, this)));
            }
            else
                this.hintBtn.runAction(cc.sequence(cc.jumpBy(0.4, cc.v2(0,0), this.suggestHintJumpHeight, 1), cc.delayTime(0.5)));
        } 
    },

    offSuggestHint(){
        if(this.hintBtn){
            // this.hintBtn.position = this.originHintBtnPos;
            this.countSuggestHint = Date.now();
        }  
    },

    showHintNumber(){
        this.countHintLabel.string = this.numberHint;
        if(this.numberHint <= 0) this.adsHintNode.active = true;
        else this.adsHintNode.active = false;
        this.countHintNode.active = !this.adsHintNode.active;
        window.gamePlay.saveMgr.saveData(null, null, this.numberHint);
    },

    showQuitPopup(){
        if(window.gamePlay.isWin)return;

        let quit = cc.instantiate(this.quitPopup);
        window.gamePlay.node.addChild(quit, 10);
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
