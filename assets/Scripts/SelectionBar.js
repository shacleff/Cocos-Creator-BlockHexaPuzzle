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
        this.node.zIndex = 3;
        // this.node.width = window.gamePlay.node.width;
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
        this.rangerWidth = window.gamePlay.node.width - this.margin.x;
        //shuffle random array
        for (let i = this.pieceRects.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [this.pieceRects[i], this.pieceRects[j]] = [this.pieceRects[j], this.pieceRects[i]];
        }

        //set anchor point for each piece
        for(let piece of this.pieceRects){
            let node = piece.node;
            let box = node.getBoundingBoxToWorld();
            let newAnchorPos = cc.v2(box.x + box.width / 2, box.y + box.height / 2);
            let oldAnchorPos = node.parent.convertToWorldSpaceAR(node.position.clone());
            let offset = newAnchorPos.sub(oldAnchorPos);
            offset.mulSelf(2);
            for(let child of node.children)child.position = child.position.sub(offset);
        }

        //set position
        this.node.getComponent(cc.ScrollView).enabled = false;
        let gridBox = cc.v2(this.margin.x, 0);
        let girdPos = this.grid.convertToNodeSpaceAR(cc.v2(gridBox.x, gridBox.y));
        cc.log("Start : " + girdPos);
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
                x += Math.abs(size.height - size.width) / 2; 
            }
            pieceWidth += 50;
            if(totalWidth + pieceWidth >= this.rangerWidth){
                if(numberRow == 1){
                    for(let piece of pieceHandled)this.putPieceAnchor(piece.node, 1, piece.canRotate);
                    anchor = -1;
                    x = startX;
                    if(piece.canRotate)x += Math.abs(size.height - size.width) / 2;
                }
                else if(numberRow == 2){
                    anchor = 0;
                    numberRow = 1;
                    pieceHandled.length = 0;
                    // this.node.getComponent(cc.ScrollView).enabled = true;
                    startX = x;
                }  
                totalWidth = 0;
                ++numberRow;
            }

            while(true){
                if(totalWidth + pieceWidth >= this.rangerWidth){
                    if(numberRow == 2){

                    }
                    this.node.getComponent(cc.ScrollView).enabled = true;
                }
                this.putPieceAnchor(piece.node, anchor, piece.canRotate, x);
                let intersect = false;
                for(let other of pieceHandled){
                    if(this.isIntersects(piece.node, other.node)){
                        intersect = true;
                        let width = other.node.getBoundingBoxToWorld().width;
                        x += width
                        totalWidth += width;
                        break;
                    }
                }
                if(!intersect)break;
                cc.log("interest");
            }
            
            x += pieceWidth;
            totalWidth += pieceWidth;
            pieceHandled.push(piece);
        }

        this.beauty();
        
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
            let subY = this.rangeHeightMin - position.y;;
            // if(canRotate && box.height < box.width)subY = this.rangeHeightMin - position.x;
            newPos.y = newPos.y + subY;
        }else if(anchor == 1){
            let side = box.height;
            if(canRotate && box.height < box.width)side = box.width;
            let subY = (this.rangeHeightMax - side) - position.y;
            newPos.y = newPos.y + subY;
        }else {
            // let subY = 0 - position.y;
            // newPos.y = newPos.y + subY;
            newPos.y = 0;
        }

        pieceNode.position = newPos;
        let pieceCom = pieceNode.getComponent('Piece');
        if(pieceCom){
            pieceCom.positionPiecesArea = newPos;
            pieceCom.revertToPieces(0, true);
        }
        
        return cc.size(box.width, box.height);
    },

    isIntersects(pieceNode1, pieceNode2){
        let box1 = pieceNode1.getBoundingBoxToWorld();
        let box2 = pieceNode2.getBoundingBoxToWorld();
        return box1.intersects(box2);
    },

    beauty(){
        let clonePiece = Array.from(this.pieceRects);
        for(let i in clonePiece){
            let piece = clonePiece[i];
            let piecePos = piece.node.position;
            cc.log(`piece ${i}: ` + piecePos);

            let sameCell = this.findPieceSameCell(piece, clonePiece);
            if(sameCell){
                let box1 = piece.node.getBoundingBoxToWorld();
                let box2 = sameCell.node.getBoundingBoxToWorld();
                if(piecePos.y > 0){
                    let side = box2.height > box2.width ? box2.height : box2.width;
                    let distance = box1.y - (box2.y + side);
                    cc.log("distance when > 0 : " + distance);
                    piece.node.position = piece.node.position.sub(cc.v2(0, distance / 5));
                    sameCell.node.position = sameCell.node.position.add(cc.v2(0, distance / 5));

                } else if(piecePos.y < 0){
    
                }
            } else this.putPieceAnchor(piece.node, 0, piece.canRotate);
        }

        for(let piece of this.pieceRects){
            piece.positionPiecesArea = piece.node.position;
            piece.revertToPieces(0, true); 
        }
    },

    findPieceSameCell(piece, array){
        for(let i in array){
            let p = array[i];
            let box1 = piece.node.getBoundingBoxToWorld();
            let box2 = p.node.getBoundingBoxToWorld();
            let widthCampare = box1.width > box2.width ? box1.width : box2.width;
            if(~~box1.x == ~~box2.x && ~~box1.y == ~~box2.y && ~~box1.width == ~~box2.width && ~~box1.height == ~~box2.height)continue;
            let sub = Math.abs(~~box1.x - ~~box2.x);
            if(sub <= widthCampare){
                array.splice(Number(i), 1);
                return p;
            }
        }
        return null;
    },

    drawTest(){
        //ONLY test Rect
        let test = window.gamePlay.node.getChildByName('Test');
        test.zIndex = 10;
        if(test){
            test = test.getComponent(cc.Graphics);
            test.clear();
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
                test.circle(newAnchorPos.x, newAnchorPos.y, 10);
                test.fillColor = cc.Color.YELLOW;
                test.fill();

                //position
                test.lineTo(0,0);
                test.circle(oldAnchorPos.x, oldAnchorPos.y, 10);
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
