const KEY_LEVEL = 'level';
const KEY_DIFFICULT = 'difficult';
const KEY_HINTS = 'hints'

cc.Class({
    extends: cc.Component,

    properties: {
        levelNode: cc.Node,
        functionNode: cc.Node,
        isClearData: false,
        maxLevelSaved : 3
    },

    onLoad(){
        if(this.isClearData)cc.sys.localStorage.clear();
        let data = this.loadData();
        let levelMgr = this.levelNode.getComponent('LevelManager');
        let actionMgr = this.functionNode.getComponent('FunctionHandler');
        console.log(`LOAD level : ${data.level}, diffi : ${data.difficult}, hints: ${data.hints}`);
        if(data.level)levelMgr.currentLevel = Number(data.level);
        if(data.difficult)levelMgr.currentDifficult = Number(data.difficult);
        if(data.hints)actionMgr.numberHint = Number(data.hints);
    },

    loadData(){
        let level = cc.sys.localStorage.getItem(KEY_LEVEL);
        let difficult = cc.sys.localStorage.getItem(KEY_DIFFICULT);
        let hints = cc.sys.localStorage.getItem(KEY_HINTS);
        return {level, difficult, hints};
    },

    saveData(level, difficult, hints){
        if(level)cc.sys.localStorage.setItem(KEY_LEVEL, level);
        if(difficult)cc.sys.localStorage.setItem(KEY_DIFFICULT, (difficult > 3 ?  3 : difficult));
        if(hints)cc.sys.localStorage.setItem(KEY_HINTS, hints);

        console.log(`SAVE level : ${level}, diffi : ${difficult}, hints: ${hints}`);
    },
});
