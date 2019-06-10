// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Range = require('./Range');
let Difficult = cc.Class({
    name: 'Difficult',
    properties:{
        totalBlocks :{
            type: Range,
            default: null
        },
        pieces :{
            type: Range,
            default: null
        },
        piecesBlocks :{
            type: Range,
            default: null
        },
        numberHoles:{
            type: Range,
            default: null
        },
        rotatablePieceRate:{    //array percent of spawn rate
            type: cc.Integer,
            default: []
        },
        rateHole: 0,
        
    }
});

let Level = cc.Class({
    name: 'Level',
    properties:{
        number: 0,
        difficult : 0
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        currentDifficult : 1,
        currentLevel : 1,
        represent : cc.Node,
        timeMinToCompletedALevel : 30,
        timeMinToReduceDifficultNextReset : 60,
        timeConditionToIncreDifficult :{
            default: [],
            type: cc.Integer
        },
        rateChangeDifficult : 1,
        nextLevelDifficultChange :1,

        difficults :{
            type: Difficult,
            default: []
        },
    },

    preStart(){
        this.countTime = 0;
        this.currentDifficult -= 1;
        this.currentLevel -= 2;
        this.save = false;
        this.countIncreDiffi = -1;
    },

    nextLevel(){
        let numberOfDifficult = this.currentDifficult < 0 ? 1 : this.currentDifficult + 1;
        if(window.gamePlay.functionHandler.isHint){  //reduce next difficult when use hint
            this.currentDifficult = cc.misc.clampf(this.currentDifficult - ~~this.nextLevelDifficultChange, 0, this.difficults.length - 1);
            this.countIncreDiffi = 0;
        } else if(this.countTime > this.timeMinToCompletedALevel * numberOfDifficult * this.rateChangeDifficult){ //reduce next difficult
            this.currentDifficult = cc.misc.clampf(this.currentDifficult - ~~this.nextLevelDifficultChange, 0, this.difficults.length - 1);
            this.countIncreDiffi = 0;
        } else if(this.countTime <= this.timeConditionToIncreDifficult[this.countIncreDiffi] * numberOfDifficult * this.rateChangeDifficult){ //incre difficult
            this.countIncreDiffi++;            
            if(this.countIncreDiffi == this.timeConditionToIncreDifficult.length){
                this.currentDifficult = cc.misc.clampf(this.currentDifficult + ~~this.nextLevelDifficultChange, 0, this.difficults.length - 1);
                this.countIncreDiffi = 0;
                this.countIncreDiffi--;
            }
        }
        if(this.countIncreDiffi < 0)this.countIncreDiffi = 0;

        window.gamePlay.functionHandler.isHint = false;
        console.log("count Incre " + this.countIncreDiffi);
        console.log("difficult : " + (this.currentDifficult + 1) + " with at time : " + this.countTime);
        this.countTime = 0;
        this.save = false;
        let result = new Level();
        result.levelNumber = ++this.currentLevel;
        result.difficult = this.difficults[this.currentDifficult];
        if(this.represent){
            let label = this.represent.getChildByName('Number').getComponent(cc.Label);
            if(label)label.string = (this.currentLevel + 1);
        }
        return result;
    },
    
    update(dt){
        this.countTime += dt;
        let numberOfDifficult = this.currentDifficult < 0 ? 1 : this.currentDifficult + 1;
        if(this.countTime > this.timeMinToReduceDifficultNextReset * numberOfDifficult * this.rateChangeDifficult && !window.gamePlay.isWin && !this.save){
            this.countIncreDiffi = 0;
            this.save = true;     
            this.currentDifficult = cc.misc.clampf(this.currentDifficult - ~~this.nextLevelDifficultChange, 0, this.difficults.length - 1)
            console.log("save reduce " + (this.currentDifficult + 1));
            window.gamePlay.saveMgr.saveData(null, this.currentDifficult + 1, null);
        }
    }
});
