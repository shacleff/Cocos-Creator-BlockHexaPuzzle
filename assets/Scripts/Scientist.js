// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const ANIMATION_IDLE = "idle";
const ANIMATION_LIKE = "like";
const ANIMATION_SAD = "sad";
const ANIMATION_ANGRY = "angry";
const ANIMATION_BORED = "bored";

cc.Class({
    extends: cc.Component,

    properties: {
        _animation: null,
        _armature: null,
        numberHappyAfterHint : 1,
        numberSadWhenBack: -1,
        numberAngryWhenRefresh: 1,
        numberBored: 1,
        timeBoredBeforeHint : 3
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._animation = this.getComponent(dragonBones.ArmatureDisplay);
        this._armature = this._animation.armature();
        // this.idle();
    },
    like(){
        this._animation.playAnimation(ANIMATION_LIKE, this.numberHappyAfterHint);
    },
    sad(){
        // this._armature.animation.fadeIn(ANIMATION_SAD, -1, -1, 0, ANIMATION_IDLE);
        this._animation.playAnimation(ANIMATION_SAD, this.numberSadWhenBack);
    },
    angry(){
        // this._armature.animation.fadeIn(ANIMATION_ANGRY, -1, -1, 0, ANIMATION_IDLE);
        this._animation.playAnimation(ANIMATION_ANGRY, this.numberAngryWhenRefresh);
    },
    bored(){
        this._animation.playAnimation(ANIMATION_BORED, this.numberBored);
    },
    idle () {  
        this._animation.playAnimation(ANIMATION_IDLE, -1);
    },
});
