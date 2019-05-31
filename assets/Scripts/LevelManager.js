// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import {Range} from 'GamePlay.js';
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
        difficults :{
            type: Difficult,
            default: []
        },
        currentDifficult : 0,
        currentLevel : -1,
        represent : cc.Node,
        secondsToIncreDifficult : 30
    },
    onLoad(){
        this.countTime = 0;
        let isIncreDifficult
    },

    nextLevel(){
        if(this.countTime <= 30 * 1000 && this.currentDifficult < this.difficults.length - 1)
            this.currentDifficult++;
        if(this.countTime > 30 * 1000 && this.currentDifficult > 0)
            this.currentDifficult--;
        console.log("difficult : " + this.currentDifficult);
        this.countTime = 0;
        let result = {
            levelNumber : ++this.currentLevel,
            difficult : this.difficults[this.currentDifficult - 1]
        }
        if(this.represent){
            let label = this.represent.getChildByName('Number').getComponent(cc.Label);
            if(label)label.string = (this.currentLevel + 1);
        }
        return result;
    },
    
    update(dt){
        this.countTime += dt;
    }
});
