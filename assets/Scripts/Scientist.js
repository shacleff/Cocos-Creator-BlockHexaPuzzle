// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const NORMAL_ANIMATION_GROUP = "idle";
cc.Class({
    extends: cc.Component,

    properties: {
        _animation: null,
        _armature: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._animation = this.getComponent(dragonBones.ArmatureDisplay);
        this._armature = this._animation.armature();
    },
    onHexagonGroupisTrue(){
// change a to b animation
        this._armature.animation.fadeIn("like", -1, -1, 0, NORMAL_ANIMATION_GROUP);
    },
    onGameOver(){
    // change a to b animation
    this._armature.animation.fadeIn("sad", -1, -1, 0, NORMAL_ANIMATION_GROUP);
    },
    onHexagonGroupisFalse(){
   // change a to b animation
   this._armature.animation.fadeIn("angry", -1, -1, 0, NORMAL_ANIMATION_GROUP);
    },
    start () {  
      this._animation.buildArmature("idle");
    },
    onPlay() {
        console.log('onPlay');
        //this.stateLabel.string = 'onPlay';
    },

    // update (dt) {},
});
