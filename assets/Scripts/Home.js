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
        piece: {
            default: null,
            type: cc.Node
        },
        hexagoGoTo: {
            default: null,
            type: cc.Node
        },
        delayTimeToRun : 3,
        timeMove : 3,
        delayTimeToReset : 1
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        window.gamePlay = this;
        let fd = this.node.getChildByName('FunctionHandler');
        if(fd){
            let com = fd.getComponent('FunctionHandler');
            if(com)com.isPaused = true;
        }
        cc.director.preloadScene('GamePlay');
        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{
            cc.director.loadScene('GamePlay');
        }, this);
    },

    start () {
        this.oldPos = this.piece.position; 
        this.run();
    },

    run(){
        this.piece.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(this.delayTime),
            cc.moveTo(this.timeMove, this.hexagoGoTo.position), 
            cc.delayTime(this.delayTimeToReset),
            cc.callFunc(()=>{
                    this.piece.position = this.oldPos;
            }, this))
        ));
    },
});
