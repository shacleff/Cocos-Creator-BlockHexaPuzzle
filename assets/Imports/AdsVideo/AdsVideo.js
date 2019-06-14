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
        duration: 5,
        progressBar:{
            type: cc.ProgressBar,
            default: null
        },
        skipBtn: {
            type: cc.Button,
            default: null
        }
    },


    onLoad () {    
        let size = window.gamePlay.node.getContentSize();
        this.node.setContentSize(size);
    },

    start () {    
        this.progressBar.progress = 1;
        this.skipBtn.node.active = false;
    },

    update(dt){
        if(this.progressBar.progress > 0){
            let subTime = (1 / this.duration) * dt;
            this.progressBar.progress -= subTime;
        }else if(!this.skipBtn.active){
            this.progressBar.progress = 0;
            this.skipBtn.node.active = true;
        }
    },

    skipAds(){
        this.node.destroy();
        if(this.skipCallBack){
            this.skipCallBack();
        }
    }

    
});
