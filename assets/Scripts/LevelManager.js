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
        secondsToIncreDifficult : 30,
        difficults :{
            type: Difficult,
            default: []
        },
        rateDifficulty : 0.5,
        timeSpendToWithout : 60,
        nextLevelDifficulty :1
    },

    preStart(){
        this.countTime = 0;
        this.currentDifficult -= 2;
        this.currentLevel -= 2;
        this.save = false;
    },

    nextLevel(){
        if(this.countTime <= this.secondsToIncreDifficult * (this.currentDifficult+1) * this.rateDifficulty && this.currentDifficult < this.difficults.length - 1)
            this.currentDifficult += this.nextLevelDifficulty;
        else if((this.countTime > this.secondsToIncreDifficult * this.currentDifficult * this.rateDifficulty || window.gamePlay.functionHandler.isHint == true)&& this.currentDifficult > 0)
            this.currentDifficult -= this.nextLevelDifficulty;
        window.gamePlay.functionHandler.isHint = false;
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
        if(this.countTime > this.timeSpendToWithout * this.currentDifficult && this.currentDifficult > 0 && window.gamePlay.result == "none" && this.save == false && this.currentDifficult < this.difficults.length - 1){
            this.save = true;     
            console.log("cur : " + this.currentDifficult);  
            this.currentDifficult = cc.misc.clampf(this.currentDifficult - this.nextLevelDifficulty, 0, this.difficults.length - 1)
            window.gamePlay.saveMgr.saveData(null, this.currentDifficult + 1, null);
        }
    }
});
