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
        pieceRects:{    
            default : [],   //array PieceRect object
            visible : false,
        },
        margin : cc.v2(0,0),
        ratioMarginBox : cc.size(1,1),

        testPrefab: {
            default: null,
            type: cc.Prefab
        },

        grid: cc.Node,
    },

    onLoad () {
        this.rangeHeightMax = this.grid.height / 2 + this.grid.position.y;
        this.rangeHeightMin = this.grid.position.y - this.grid.height / 2;
        this.node.zIndex = 2;
    },

    clear(){
        this.pieceRects.length = 0;
    },

    push(piece){
        if(piece.blocks.length > 0){
            this.pieceRects.push(piece);
            piece.node.removeFromParent(false);
            this.grid.addChild(piece.node);
        }
    },

    resize(){
        if(this.pieceRects.length <= 0)return;

        //shuffle random array
        for (let i = this.pieceRects.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [this.pieceRects[i], this.pieceRects[j]] = [this.pieceRects[j], this.pieceRects[i]];
        }

        //set anchor point for each piece
        for(let piece of this.pieceRects){
            let node = piece.node;
            let oldPos = node.position.clone();
            let box = node.getBoundingBoxToWorld();
            let newAnchorPos = cc.v2(box.x + box.width / 2, box.y + box.height / 2);
            cc.log("Anchor : " + newAnchorPos);
            let oldAnchorPos = node.parent.convertToWorldSpaceAR(node.position.clone());
            cc.log("Position : " + oldAnchorPos);
            let offset = newAnchorPos.sub(oldAnchorPos);
            offset.mulSelf(2);
            cc.log("OFfset : " + offset);
            for(let child of node.children)child.position = child.position.sub(offset);
            // for(let b of piece.blocks)b.position = b.position.sub(offset);
            // for(let o of piece.outLines)o.position = o.position.sub(offset);
            //after 
            box = node.getBoundingBoxToWorld();
            newAnchorPos = cc.v2(box.x + box.width / 2, box.y + box.height / 2);
            cc.log("Anchor : " + newAnchorPos);
            oldAnchorPos = node.parent.convertToWorldSpaceAR(node.position.clone());
            cc.log("Position : " + oldAnchorPos);
            offset = newAnchorPos.sub(oldAnchorPos);
            cc.log("OFfset : " + offset);

            // piece.resetAnchor();
            cc.log("-----------------");
        }

        //set position
        let gridBox = this.grid.getBoundingBoxToWorld();
        let girdPos = this.grid.convertToNodeSpaceAR(cc.v2(gridBox.x, gridBox.y));
        let startX = girdPos.x;
        let x = startX;
        let anchor = 0;
        let numberRow = 1;
        let totalWidth = 0;
        let pieceHandled = [];
        for(let piece of this.pieceRects){
            let size = piece.node.getBoundingBoxToWorld();
            let pieceWidth = size.width;
            if(piece.canRotate)
            {
                if(size.width < size.height)pieceWidth = size.height;
                // x += size.height;
                // totalWidth += size.height;
            }
            pieceWidth += 50;
            if(totalWidth + pieceWidth >= this.node.width){
                if(numberRow == 1){
                    for(let piece of pieceHandled)this.putPieceAnchor(piece, 1, piece.canRotate);
                    anchor = -1;
                    x = startX;
                }
                else if(numberRow == 2){
                    anchor = 1;
                    numberRow = 1;
                }  
                totalWidth = 0;
                ++numberRow;
                pieceHandled.length = 0;
            }

            this.putPieceAnchor(piece.node, anchor, false, x);
            x += pieceWidth;
            totalWidth += pieceWidth;
            pieceHandled.push(piece.node);
        }

        this.node.getComponent(cc.ScrollView).enabled = false;

        
        //tutorial for rotate 
        let wasTutorial = false;
        for(let piece of this.pieceRects){
            if(piece && piece.canRotate) {
                let randomRo = ~~(Math.random() * 2);
                for(let i = 0; i < randomRo; i++)window.gamePlay.actionHandler.rotatePiece(piece);
                window.gamePlay.actionHandler.showCanRotate(piece);
                if(!wasTutorial){
                    window.gamePlay.tutorial.showRotatePieceTutorial(piece.node);
                    wasTutorial = true;
                }
            }
        }

        this.drawTest();
    },

    //@anchor : -1 down, 1 top, 0 center
    putPieceAnchor(pieceNode, anchor, canRotate = false ,x = null){
        let box = pieceNode.getBoundingBoxToWorld();
        let position = this.grid.convertToNodeSpaceAR(cc.v2(box.x, box.y));
        let sub = x ? x - position.x : 0;
        let newPos = cc.v2(pieceNode.position.x + sub, pieceNode.position.y); 
        
        if(anchor == -1){
            let subY = this.rangeHeightMin - position.y;
            if(canRotate && box.height < box.width)subY -= (box.width - box.height);
            newPos.y = newPos.y + subY;
        }else if(anchor == 1){
            let side = box.height;
            if(canRotate && box.height < box.width)side = box.width;
            let subY = (this.rangeHeightMax - side) - position.y;
            newPos.y = newPos.y + subY;
        }else {
            let subY = 0 - position.y;
            newPos.y = newPos.y + subY;
        }

        pieceNode.position = newPos;
        let pieceCom = pieceNode.getComponent('Piece');
        if(pieceCom){
            pieceCom.positionPiecesArea = newPos;
            pieceCom.revertToPieces(0, true);
        }
        
        return cc.size(box.width, box.height);
    },

    drawTest(){
        //ONLY test Rect
        let test = window.gamePlay.node.getChildByName('Test');
        test.zIndex = 10;
        if(test){
            test = test.getComponent(cc.Graphics);
            // test.clear();
            for(let piece of this.pieceRects){
                let box = piece.node.getBoundingBoxToWorld();
                let position = cc.v2(box.x, box.y);
                // position = this.grid.convertToWorldSpaceAR(position);
                position = window.gamePlay.node.convertToNodeSpaceAR(position);
                test.lineTo(0,0);
                test.rect(position.x, position.y, box.width, box.height);
                test.strokeColor = cc.Color.RED;
                test.stroke();  
                
                //anchor
                let newAnchorPos = cc.v2(box.x + box.width / 2, box.y + box.height / 2);
                newAnchorPos = window.gamePlay.node.convertToNodeSpaceAR(newAnchorPos);
                let oldAnchorPos = piece.node.parent.convertToWorldSpaceAR(piece.node.position.clone());
                oldAnchorPos = window.gamePlay.node.convertToNodeSpaceAR(oldAnchorPos);

                test.lineTo(0,0);
                test.circle(newAnchorPos.x, newAnchorPos.y, 20);
                test.fillColor = cc.Color.YELLOW;
                test.fill();

                //position
                test.lineTo(0,0);
                test.circle(oldAnchorPos.x, oldAnchorPos.y, 20);
                test.fillColor = cc.Color.WHITE;
                test.fill();
            }
            // let box = this.node.getBoundingBoxToWorld()
            let box = this.grid.getBoundingBoxToWorld();
            let position = cc.v2(box.x, box.y);
            position = window.gamePlay.node.convertToNodeSpaceAR(position);
            test.rect(position.x, position.y, box.width, box.height);
            test.stroke();
        }
    }
});
