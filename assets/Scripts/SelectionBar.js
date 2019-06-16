// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var Range = require('./Range');

function PieceRect(piece, rect, horizontal, vertical){
    this.piece = piece;
    this.rect = rect;
    this.horizontal = new Range();
    this.horizontal.set(horizontal);
    this.vertical = new Range();
    this.vertical.set(vertical);
};

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
    },

    onLoad () {
        this.rangeHorizontal = this.node.width / 2 - this.margin.x;
        this.rangeVertical = this.node.height / 2 - this.margin.y;
    },

    clear(){
        this.pieceRects.length = 0;
    },

    push(piece){
        if(piece.blocks.length > 0){
            let startPosition = piece.blocks[0].getPosition();
            let sizeBlock = this.getTrueSize(piece.blocks[0].getContentSize());
            let horizontal = new Range(), vertical = new Range();
            for(let block of piece.blocks){
                let subPosition = block.getPosition().sub(startPosition);
                subPosition.divSelf(2);
                if(subPosition.x != 0){
                    if(subPosition.x < horizontal.min)horizontal.min = subPosition.x;
                    else if(subPosition.x > horizontal.max)horizontal.max = subPosition.x;
                }
                if(subPosition.y != 0){
                    if(subPosition.y < vertical.min)vertical.min = subPosition.y;
                    else if(subPosition.y > vertical.max)vertical.max = subPosition.y;
                }
            }

            let position = cc.v2(0, 0);
            piece.positionPiecesArea = position;
            piece.revertToPieces(0, true);

            //for Rect
            horizontal.min -= sizeBlock.width/2;
            horizontal.max += sizeBlock.width/2;
            vertical.min -= sizeBlock.height/2;
            vertical.max += sizeBlock.height/2;
            let posRect = cc.v2(position.x + horizontal.min, position.y + vertical.min);
            let rect = cc.rect(posRect.x, posRect.y, horizontal.max - horizontal.min, vertical.max - vertical.min);
            this.pieceRects.push(new PieceRect(piece, rect, horizontal, vertical));
            
        }
    },

    resize(){
        //shuffle random array
        for (let i = this.pieceRects.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [this.pieceRects[i], this.pieceRects[j]] = [this.pieceRects[j], this.pieceRects[i]];
        }

        //set anchor point for each piece
        for(let pieceRect of this.pieceRects){
            if(pieceRect.piece.canRotate){
                let oldAnchorPos = pieceRect.piece.node.position;
                let rect = pieceRect.rect;
                let newAnchorPos = cc.v2(rect.x + rect.width / 2, rect.y + rect.height / 2);
                let offset = newAnchorPos.sub(oldAnchorPos);
                for(let block of pieceRect.piece.blocks)block.position = block.position.sub(offset);
        
                let side = rect.width > rect.height ? rect.width : rect.height;
                pieceRect.horizontal.min = -side / 2;
                pieceRect.horizontal.max = side / 2;
                pieceRect.vertical.min = -side / 2;
                pieceRect.vertical.max = side / 2;

                offset = cc.v2(Math.abs(offset.x), Math.abs(offset.y));
                pieceRect.rect.x = cc.v2(newAnchorPos.x - side / 2 - offset.x / 2);
                pieceRect.rect.y = cc.v2(newAnchorPos.y - side / 2 - offset.y / 2);
                rect.width = side + offset.x / 2;
                rect.height = side + offset.y / 2;
            }
        }
        
        let row = 1;
        let posStart = cc.v2(-this.rangeHorizontal, this.rangeVertical);
        posStart = this.convertFromBarToCanvasPos(posStart);
        let posTemp = posStart.clone();
        for(let pieceRect of this.pieceRects){
            if(pieceRect.piece.blocks.length > 0){
                let rect = pieceRect.rect;
                if(posTemp.x + rect.width > this.rangeHorizontal + this.margin.x){
                    posTemp.x = posStart.x;
                    posTemp.y = -this.rangeVertical;
                    posTemp = this.convertFromBarToCanvasPos(posTemp);
                    row = 2;
                }
                if(row == 1){
                    posTemp.y = this.node.position.y + this.rangeVertical - rect.height;
                }

                let position = cc.v2(posTemp.x - pieceRect.horizontal.min, posTemp.y - pieceRect.vertical.min);
                pieceRect.piece.positionPiecesArea = position;
                pieceRect.piece.revertToPieces(0, true);

                rect.x = posTemp.x;
                rect.y = posTemp.y;
                //for next
                let sizeBlock = this.getTrueSize(pieceRect.piece.blocks[0].getContentSize());
                posTemp.x += rect.width + this.ratioMarginBox.width * sizeBlock.width;
            }
        }    

        //tutorial for rotate 
        for(let pieceRect of this.pieceRects)
            if(pieceRect.piece && pieceRect.piece.canRotate){
                cc.log("uddi : " + pieceRect.piece.node.uuid);
                window.gamePlay.tutorial.showRotatePieceTutorial(pieceRect.piece.node);
                break;
            }


        //ONLY test Rect
        let test = window.gamePlay.node.getComponent(cc.Graphics);
        test.clear();
        for(let pieceRect of this.pieceRects){
            let rect = pieceRect.rect;
            test.lineTo(0,0);
            test.rect(rect.x, rect.y, rect.width, rect.height);
            test.stroke();    
        }
    },

    convertFromBarToCanvasPos(position){
        return position.add(this.node.position);
    },

    getTrueSize(size){
        let actionHandler =  window.gamePlay.actionHandler;
        return cc.size(size.width * actionHandler.selectionScale, size.height * actionHandler.selectionScale);
    }
});
