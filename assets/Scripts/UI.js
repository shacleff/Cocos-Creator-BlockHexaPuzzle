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
       homeButton:{
           default: null,
           type: cc.Button,
       },
       undoButton:{
        default: null,
        type: cc.Button,
    },
    refressButton:{
        default: null,
        type: cc.Button,
    },
    helpButton:{
        default: null,
        type: cc.Button,
    },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.homeButton.node.on('click', this.callback, this);
        this.undoButton.node.on('click', this.undoLastMove, this);
    },

    callback(){
        console.log("This is Home button");
    },
    undoLastMove(){
        console.log("Undo last move");
    },
    start () {

    },

    // update (dt) {},
});
