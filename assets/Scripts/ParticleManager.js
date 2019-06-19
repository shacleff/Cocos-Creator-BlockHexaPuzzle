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
        frames :{
            type: cc.SpriteFrame,
            default: []
        },
        
        duration : 40,
        createPariticleTimeMin: 10,
        createPariticleTimeMax: 20,
        numberParicleStart : 3
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.countTime = 0;
    },

    start(){
        for(let i = 0; i < this.numberParicleStart; ++i)this.createParticle();
    },

    createParticle(){
        let y = 1080;
        if(window.gamePlay && window.gamePlay.node && window.gamePlay.node.isValid)y = window.gamePlay.node.height;
        let particle = new cc.Node();
        particle.position = this.getRandomPos();
        particle.scale = 0.5;
        this.node.addChild(particle);

        let sprite = particle.addComponent(cc.Sprite);
        sprite.spriteFrame = this.frames[~~(Math.random() * this.frames.length)];
        particle.runAction(cc.sequence(cc.moveBy(this.duration, 0, y), cc.removeSelf()));
    },

    update (dt) {
        this.countTime += dt;
        let time = RandomRange(this.createPariticleTimeMin, this.createPariticleTimeMax);
        if(this.countTime >= time){
            this.createParticle();
            this.countTime = 0;
        }
    },

    getRandomPos(){
        let size = this.node.getContentSize();
        let halfWidth = size.width / 2;
        let halfHeight = size.height / 2;
        let x = RandomRange(-halfWidth, halfWidth);
        let y = RandomRange(-halfHeight, halfHeight);
        return cc.v2(x, y);
    }
});
