// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        congratulationLabeL : cc.Node,
        congratulationTexts:{
            default: [],
            type: cc.String
        },
    },

    onLoad(){
        this.node.getChildByName('BG').on(cc.Node.EventType.TOUCH_START, ()=>{}, this);
        this.coinsAdded = 0;
    },

    onEnable(){
        let text = "FANTASTIC!";
        if(this.congratulationTexts.length > 0)text = this.congratulationTexts[~~(Math.random() * this.congratulationTexts.length)];
        this.congratulationLabeL.getComponent(cc.Label).string = text + " ";
    },

    next(){
        //do something when click next button
        window.gamePlay.reset();
    }
});
