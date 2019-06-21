const KEY_ROTATE_TUTORIAL = 'rotate_tutorial';

cc.Class({
    extends: cc.Component,

    properties: {
        tutorialPrefab :{
            default: null,
            type: cc.Prefab
        },
    },

    load(){
        this.rotateTutorial = null;
        this.uuidPieceTutorial = 0;
        this.rotateTutorialShowed = false;
        this.loadSave();
    },

    resetRotatePieceTutorial(){
        this.hideRotatePieceTutorial();
        // this.rotateTutorialShowed = false;
    },  

    showRotatePieceTutorial(pieceNode){
        if(this.rotateTutorialShowed || this.rotateTutorial)return;
        this.uuidPieceTutorial = pieceNode.uuid;
        this.rotateTutorial = cc.instantiate(this.tutorialPrefab);
        let piece = pieceNode.getComponent('Piece');
        if(piece && piece.blocks.length > 0)this.rotateTutorial.setPosition(this.getPositionBotRightPiece(piece));
        else this.rotateTutorial.setPosition(pieceNode.position);
        window.gamePlay.node.addChild( this.rotateTutorial, 30);
        this.rotateTutorialShowed = true;
        this.save(KEY_ROTATE_TUTORIAL, true);
    },

    getPositionBotRightPiece(piece){
        let okPos = piece.blocks[0].position;
        for(let block of piece.blocks){
            let pos = block.position;
            if(pos.y < okPos.y || (pos.y == okPos.y && pos.x < okPos.x))
                okPos = pos;
        }
        okPos = window.gamePlay.convertToCanvasPosition(piece.node, okPos);
        return okPos;
    },

    hideRotatePieceTutorial(){
        if(this.rotateTutorial)this.rotateTutorial.destroy();
        this.rotateTutorial = null;
    },

    save(key, value){
        cc.sys.localStorage.setItem(KEY_ROTATE_TUTORIAL, value);
    },

    loadSave(){
        let rotate = cc.sys.localStorage.getItem(KEY_ROTATE_TUTORIAL);
        if(rotate)this.rotateTutorialShowed = rotate;
        else this.rotateTutorialShowed = false;
    },
});
