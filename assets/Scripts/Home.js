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
        welcomPlayPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        window.gamePlay = this;
        let fd = this.node.getChildByName('FunctionHandler');
        if(fd){
            let com = fd.getComponent('FunctionHandler');
            if(com)com.isPaused = true;
        }
        this.actionHandler = this.node.getChildByName('ActionHandler').getComponent('ActionHandler');
        let play = this.node.getChildByName('PlayBtn');
        if(play)play.zIndex = 10;
        let title = this.node.getChildByName('Hex LOGO');
        if(title)title.zIndex = 10;
        //Event
        cc.director.preloadScene('GamePlay');
        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{
            cc.director.loadScene('GamePlay');
        }, this);
    },

    start(){
        this.autoPlay = cc.instantiate(this.welcomPlayPrefab);
        this.node.addChild(this.autoPlay);
    },

    refresh(){
        this.node.runAction(
            cc.callFunc(()=>{
                this.autoPlay.destroy();
                this.autoPlay = cc.instantiate(this.welcomPlayPrefab);
                this.node.addChild(this.autoPlay);
            }, this)
        )
    }
});
