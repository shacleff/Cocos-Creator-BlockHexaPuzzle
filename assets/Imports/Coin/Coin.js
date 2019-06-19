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
        coinAddedLabel: {
            default: null,
            type: cc.Node
        },
        coin : 100,
        keySave: "coin"
    },

    onLoad(){
        this.node.zIndex = 110;
        let coinSave = cc.sys.localStorage.getItem(this.keySave);
        if(coinSave)this.coin = Number(coinSave);
        this.label = this.node.getChildByName('Count').getComponent(cc.Label);
        this.label.string = this.coin;
    },

    addCoin(value){
        this.coin += value;
        this.label.string = this.coin;
        this.coinAddedLabel.getComponent(cc.Label).string = this.convertCoinToString(value);
        this.saveCoins();
    },

    subCoin(value){
        if(this.enoughCoin(value))this.coin -= value;
        else{
            cc.log("Not enough coins");
        }
        this.label.string = this.coin;
        this.saveCoins();
    },

    enoughCoin(value){
        return value <= this.coin;
    },

    convertCoinToString(value){
        return value + "";
    },

    saveCoins(){
        cc.sys.localStorage.setItem(this.keySave, this.coin);
    },

    onDestroy(){
        this.saveCoins();
    }

});
