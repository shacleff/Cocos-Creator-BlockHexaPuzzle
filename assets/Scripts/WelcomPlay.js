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
    },

    destroyBlock(){
        for(let child of this.node.children){
            if(child.name == 'Block')window.gamePlay.actionHandler.destroyAnimation(child);
            else if(child.name == 'Piece'){
                for(let block of child.children){
                    if(block.name == 'Block')window.gamePlay.actionHandler.destroyAnimation(block);
                    else block.destroy();
                }
            }
        }
    },

    
    update(){
        if(!this.node.getChildByName('Block')){
            this.node.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(()=>{
                    window.gamePlay.refresh();
                }, this)));
        }
    }
});
