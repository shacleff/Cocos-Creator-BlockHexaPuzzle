// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Hexagon from 'Hexagon.js';
import {ActionHandler} from 'ActionHandler.js';

export const EDirection = cc.Enum({
    TOP: 0,
    BOT: 1,
    TOP_LEFT: 2,
    BOT_LEFT: 3,
    TOP_RIGHT: 4,
    BOT_RIGHT: 5,
    COUNT: 6     
});

export let Range = cc.Class({
    name: "Range",
    properties:{
        min: 0,
        max: 0
    },
    set(range){
        this.min = range.min;
        this.max = range.max;
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        //setting gameboard
        maxSizePlayBoard: cc.size(9,9),    //use to modify properties panel easily, please use : this.realSizePlay for logic
        pointCenterPlayBoard: cc.v2(0,0),
        ignoreFinal : false,
        //setting objects in gameboard
        hexagonPrefab:{
            default: null,
            type: cc.Prefab
        },
        hexagonGroupPrefab:{
            default: null,
            type: cc.Prefab
        },
        numberHexagonsGroup: 1,
        totalNumberHexagons:{
            type: Range,
            default: null
        },
        marginBetweenHexa: 5,
        maxDifferenceWidthHeight: 4,
        //pieces - blocks
        piecePrefab:{
            default: null,
            type: cc.Prefab
        },
        blockPrefab:{
            default: null,
            type: cc.Prefab
        },
        blockTypes:{
            default: [],
            type: cc.SpriteFrame
        },
        numberPieces : {
            type: Range,
            default: null
        },
        numberBlockEachPieces : {
            type: Range,
            default: null
        },
        maxBetweenPieces : 5,
        
    },

    // LIFE-CYCLE CALLBACKS:

    start () {
        this.isGenerating = true;
        window.gamePlay = this;
        this.realSizePlay = cc.size(this.maxSizePlayBoard.width, this.maxSizePlayBoard.height);
        this.sizeGenerate = cc.size(0, 0);
        this.positionStartGenHexa = {row : this.realSizePlay.height / 2, column : this.realSizePlay.width / 2};
        this.maxHexagon = this.realSizePlay.width * this.realSizePlay.height;
        this.grid = [];
        this.listPositionAvaiable = [];
        this.listHexagonsGroup = [];    //HexagonsGroup array
        this.generateGridPosition();
        this.nextLevel();
        this.createGame();
        this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(()=>{this.isGenerating = false;}, this)));
    },

    createGame(){
        if(this.listPositionAvaiable.length > 0){
            this.listPositionAvaiable.length = 0;
        }
        if(this.listHexagonsGroup.length > 0){
            for(let group of this.listHexagonsGroup){
                group.clear();
                group.node.destroy();
            }
            this.listHexagonsGroup.length = 0;
        }
        this.numberHexagons = this.getRandom(this.totalNumberHexagons.min, this.totalNumberHexagons.max);
        this.rangeGenerateHexa = this.calculateRangeGenHexa();
        console.log("Number hexagon : " + this.numberHexagons);
        this.generateHexagons(this.numberHexagons, this.numberHexagonsGroup);
        this.generatePieceOnHexagons();
        this.putPiecesToSelectionBar();
    },

    nextLevel(){
        let levelChild = this.node.getChildByName('LevelManager');
        if(levelChild){
            let level = levelChild.getComponent('LevelManager').nextLevel();
            this.totalNumberHexagons.set(level.difficult.totalBlocks);
            this.numberPieces.set(level.difficult.pieces);
            this.numberBlockEachPieces.set(level.difficult.piecesBlocks);
        }
    },

    reset(){
        if(!this.isGenerating){
            this.isGenerating = true;
            this.node.getChildByName('FunctionHandler').getComponent('FunctionHandler').history.length = 0;
            this.createGame();
            this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(()=>{this.isGenerating = false;}, this)));
        }else{
            cc.log("BBoard is generating!");
        }
    },

    checkWin(){
        let isWin = true; 
        for(let group of this.listHexagonsGroup){
            for(let hexagon of group.hexagons){
                if(hexagon.block == null){
                    isWin = false;
                    break;
                }
            }
        }
        if(isWin){
            //do something
            console.log("WIN");
            this.node.runAction(cc.sequence(cc.delayTime(0.0), cc.callFunc(()=>{
                this.nextLevel();
                this.reset();
            }, this)));
        }
    },

    putPiecesToSelectionBar(){
        let selectionBar = this.node.getChildByName('Hex_Selection_bar');
        if(selectionBar){
            let barCom = selectionBar.getComponent('SelectionBar');
            if(barCom){
                barCom.generateGrid();
                this.listHexagonsGroup.forEach(group=>{
                    for(let piece of group.pieces){
                        piece.positionInGameBoard = cc.v2(9999,9999);
                        barCom.push(piece.getComponent('Piece'));
                        ActionHandler.instance.scalePiece(piece, ActionHandler.instance.selectionScale);
                    }
                    for(let hexa of group.hexagons){
                        hexa.block = null;
                    }
                });
            }
        }
    },

    generatePieceOnHexagons(){
        //Color
        // let listTypes = this.suffleArray(Array.from(this.blockTypes));
        let listTypes = Array.from(this.blockTypes);
        let numberPieces = this.getRandom(this.numberPieces.min, this.numberPieces.max);
        while(numberPieces * this.numberBlockEachPieces.min >= this.numberHexagons){
            numberPieces = this.getRandom(this.numberPieces.min, this.numberPieces.max);
        }
        console.log("Number Pieces : " + numberPieces);
        //for number block each piece
        let totalBlocks = this.numberHexagons;
        let numberBlocksEachPieces = [];
        for(let i = 0; i < numberPieces - 1; ++i){
            let number = totalBlocks;
            let compare = ~~(totalBlocks / (numberPieces - i));
            while(number > compare){
                if(compare >= this.numberBlockEachPieces.min) number = this.getRandom(this.numberBlockEachPieces.min, this.numberBlockEachPieces.max);
                else number = this.numberBlockEachPieces.min;
            }
            numberBlocksEachPieces.push(number);
            totalBlocks -= number;
        }
        numberBlocksEachPieces.push(totalBlocks);   //final
        console.log("Number blocks each piece : " + numberBlocksEachPieces);

        for(let group of this.listHexagonsGroup){   //current is 1 group
            for(let i = 0; i < numberPieces; ++i){
                let piece = cc.instantiate(this.piecePrefab);
                this.node.addChild(piece);
                group.pieces.push(piece.getComponent('Piece'));
            }
        }
         //generate
        let posAvaiable = [];
        let isPosAvaible = pos =>{
            let find = posAvaiable.findIndex(element =>{return element.row == pos.row && element.column == pos.column;});
            if(find != -1)return true;
            return false;
        }
        let removeFromArray = (pos, array) =>{
            let find = array.findIndex(element =>{return element.row == pos.row && element.column == pos.column;});
            if(find != -1)array.splice(find, 1);
        }
        let getAroundAvaiable = startPos => {
            let result = [];
            for(let d = 0; d < EDirection.COUNT; d++){
                let pos = this.getHexagonPosAtDirection(d, startPos.row, startPos.column);
                if(isPosAvaible(pos))result.push(pos);
            }
            return result;
        }
        let arrayCreates = [];
        function create(piece, hexagon, frame){
            this.piece = piece;
            this.hexagon = hexagon;
            this.frame = frame;
        }
        let getCreateAtHexaInCreates = pos =>{
            for(let create of arrayCreates){
                if(create.hexagon && create.hexagon.row == pos.row && create.hexagon.column == pos.column)return create;
            }
            return null;
        }

        while(true)
        {     
            console.log("start gen"); 
            posAvaiable = this.suffleArray(Array.from(this.listPositionAvaiable));
            arrayCreates.length = 0;
            for(let group of this.listHexagonsGroup){
                for(let i = 0; i < group.pieces.length; ++i){
                    if(posAvaiable.length > 0){
                        let positionUsed = [];
                        let piece = group.pieces[i];
                        let type = listTypes[i >=  listTypes.length ? i - listTypes.length : i];
                        let createAt = posAvaiable[posAvaiable.length - 1];
                        positionUsed.push(createAt);
                        arrayCreates.push(new create(piece, group.getHexagonAt(createAt.row, createAt.column), type));
                        removeFromArray(createAt, posAvaiable);
                        for(let count = 1; count < numberBlocksEachPieces[i]; ++count){
                            let startPos = positionUsed[~~(Math.random() * positionUsed.length)];
                            let createdPositions = getAroundAvaiable(startPos);
                            if(createdPositions.length > 0){
                                createAt = createdPositions[~~(Math.random() * createdPositions.length)];
                                positionUsed.push(createAt);
                                arrayCreates.push(new create(piece, group.getHexagonAt(createAt.row, createAt.column), type));
                                removeFromArray(createAt, posAvaiable);
                            }
                        }
                        positionUsed.length = 0;
                    }
                }
                //fill empty hexagons
                // cc.debug();
                while(posAvaiable.length > 0){
                    for(let i = 0; i < posAvaiable.length;){
                        let checkPos = posAvaiable[i];
                        let aroundTypes = [];
                        let pieces = [];
                        for(let d = 0; d < EDirection.COUNT; d++){
                            let pos = this.getHexagonPosAtDirection(d, checkPos.row, checkPos.column);
                            let c = getCreateAtHexaInCreates(pos);
                            if(c){
                                aroundTypes.push(c.frame);
                                pieces.push(c.piece);
                            }
                        }
                        if(aroundTypes.length > 0){
                            let randIndex = ~~(Math.random() * aroundTypes.length);
                            let type = aroundTypes[randIndex];
                            let piece = pieces[randIndex];
                            if(type){
                                if(piece)arrayCreates.push(new create(piece, group.getHexagonAt(checkPos.row, checkPos.column), type));
                                removeFromArray(checkPos, posAvaiable);
                            }else ++i;
                        }else ++i;
                    }
                }
            }
            let arrayTemp = Array.from(arrayCreates);
            let isOK = true;
            for(let create of arrayTemp){
                let count = 0;
                for(let createCheck of arrayCreates){
                    if(create.frame.name == createCheck.frame.name)count++;
                }
                if(count < this.numberBlockEachPieces.min || count > this.numberBlockEachPieces.max){
                    isOK = false;
                    break;
                }
            }
            if(isOK){
                for(let create of arrayCreates){
                    let newBlock = this.createBlockAtHexagonNode(create.hexagon, create.frame); 
                    create.piece.pushBlock(newBlock);
                }
                break;
            }
        }
    },

    //@param : hexagon : is a Hexagon object 
    //@Return : a node object which contains Block component
    createBlockAtHexagonNode(hexagon, spriteFrame){
        let block = cc.instantiate(this.blockPrefab);
        block.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        block.setPosition(hexagon.node.position);
        block.zIndex = 1;
        block.setContentSize(this.sizeHexagonOnBoard.width, this.sizeHexagonOnBoard.height);
        this.node.addChild(block);
        hexagon.block = block;
        return block;
    },

    getNumberDirectionAvaiableForBlock(row, column){
        let result = [];  
        let temp = [];
        for(let i = 0; i < EDirection.COUNT; ++i){
            temp.push(this.getHexagonPosAtDirection(i, row, column));
        }
        for(let pos of temp){
            if(this.isHexagonCreatedAt(pos.row, pos.column)){
                result.push(pos);
            }
        }
        return result;
    },

    generateHexagons(numberObject, numberGroup){
        this.listHexagonsGroup.length = 0;
        if(this.hexagonPrefab && this.hexagonGroupPrefab && numberObject > 0 && numberGroup > 0 && numberGroup < numberObject){
            if(numberObject > this.maxHexagon)numberObject = this.maxHexagon;
            if(numberObject > this.rangeGenerateHexa.width * this.rangeGenerateHexa.height)
                numberObject = this.rangeGenerateHexa.width * this.rangeGenerateHexa.height;
            let numberObjectTemp = numberObject;
            let maxSizeToGen = {row: this.positionStartGenHexa.row + this.rangeGenerateHexa.height / 2,
                                column: this.positionStartGenHexa.column + this.rangeGenerateHexa.width / 2};
            let minSizeToGen = {row: maxSizeToGen.row - this.rangeGenerateHexa.height,
                                column: maxSizeToGen.column - this.rangeGenerateHexa.width};

            for(let i = 0; i < numberGroup; ++i){
                let hexagonsGroup = cc.instantiate(this.hexagonGroupPrefab);
                let hexagonsGroupCom = hexagonsGroup.getComponent('HexagonGroup');
                if(hexagonsGroupCom){
                    this.listHexagonsGroup.push(hexagonsGroupCom);
                    while(numberObjectTemp > 0){
                        let generate = (hexagonStart, number) =>{
                            if(hexagonStart){
                                let listGenerated = this.generateRandomAroundAHexagon(hexagonStart, number, minSizeToGen, maxSizeToGen);
                                listGenerated.forEach(hexagon =>{
                                    hexagonsGroupCom.push(hexagon);
                                }, this);
                                numberObjectTemp-= listGenerated.length;
                            }
                        };

                        if(hexagonsGroupCom.getNumberHexagons() == 0){
                            let hexagon = this.createHexagonsAt(this.positionStartGenHexa.row, this.positionStartGenHexa.column);
                            if(hexagon){
                                hexagonsGroupCom.push(hexagon);
                                --numberObjectTemp;
                            }
                        }else {
                            let randomStart = hexagonsGroupCom.hexagons[~~(Math.random() * hexagonsGroupCom.hexagons.length - 1) + 1];
                            if(randomStart)generate(randomStart, 1);
                            else if(numberObjectTemp > 6)generate(hexagonsGroupCom.hexagons[0], 6);
                            else generate(hexagonsGroupCom.hexagons[0], numberObjectTemp);
                        }//else{
                            // console.log("con lai : " + numberObjectTemp);
                        //     let randomStart = hexagonsGroupCom.hexagons[~~(Math.random() * hexagonsGroupCom.hexagons.length - 1) + 1]
                        //     if(randomStart){
                        //         generate(randomStart, 1);
                        //     }
                        // }
                    }
                }
            }
        }

        //@TODO: only test Grid
        // let hexagonsGroup = cc.instantiate(this.hexagonGroupPrefab);
        // let hexagonsGroupCom = hexagonsGroup.getComponent('HexagonGroup');
        // if(hexagonsGroupCom){
        //     for(let row = 0; row < this.grid.length; ++row)
        //         for(let column = 0; column < this.grid[row].length; ++column){
        //             hexagonsGroupCom.push(this.createHexagonsAt(row, column));
        //         }
        //     this.listHexagonsGroup.push(hexagonsGroupCom);
        // }
        //end test
    },

    //@Return : a cc.Node included a Hexagon object
    createHexagonsAt(row, column){
        if(this.hexagonPrefab){
            let hexagon = cc.instantiate(this.hexagonPrefab);
            if(hexagon){
                row = ~~row;
                column = ~~column;
                try {
                    let position = this.grid[row][column];
                    let hexagonCom = hexagon.getComponent('Hexagon');
                    if(hexagonCom){
                        hexagonCom.row = row;
                        hexagonCom.column = column;
                    }
                    hexagon.setPosition(position);
                    this.listPositionAvaiable.push({row, column});
                    hexagon.setContentSize(this.sizeHexagonOnBoard);
                    this.node.addChild(hexagon);
                    cc.log(`Created a hexagon at ${row} - ${column}`);
                    //create shadow
                    if(this.blockPrefab){
                        hexagonCom.createShadowOn(this.blockPrefab);
                    }
                    return hexagon;     
                } catch (error) {}
            }
        }
        return null;
    },

    //@param hexagon : is a Hexagon Object
    generateRandomAroundAHexagon(hexagonCom, numberGenerate, minRange, maxRange){
        let array = [];
        if(typeof hexagonCom != "undefined"){
            let direction = [EDirection.TOP, EDirection.BOT, EDirection.TOP_LEFT, EDirection.TOP_RIGHT, EDirection.BOT_LEFT, EDirection.BOT_RIGHT];
            direction = this.suffleArray(direction);
            while(numberGenerate > 0 && direction.length > 0){
                let position = this.getHexagonPosAtDirection(direction[direction.length - 1], hexagonCom.row, hexagonCom.column);
                if(position.row >= minRange.row && position.row <= maxRange.row && 
                    position.column >= minRange.column && position.column <= maxRange.column){
                    if(!this.isHexagonCreatedAt(position.row, position.column)){
                        let newHexagon = this.createHexagonsAt(position.row, position.column);
                        if(newHexagon != null){
                            array.push(newHexagon);
                            --numberGenerate;
                        }
                    }
                }
                direction.pop();
            }
        }
        return array;
    },

    isHexagonCreatedAt(row, column){
        for(let pos of this.listPositionAvaiable){
            if(pos.row == row && pos.column == column)
                return true;
        }
        return false;
    },

    //@direction : top - topleft - botleft - bot - botright - topright : represent for 6 edges
    getHexagonByDirection(direction, row, column, group){
        let position = this.getHexagonPosAtDirection(direction, row, column);
        return group.getHexagonAt(position.row, position.column);
    },

    //@return : a vec2 with x -> row and y -> column
    getHexagonPosAtDirection(direction, row, column){
        let findRow = row;
        let findCol = column;
        switch(direction){
            case EDirection.TOP:
                findRow += 1; 
                break;
            case EDirection.BOT:
                findRow -= 1;
                break;
            case EDirection.TOP_LEFT:
                findCol -= 1;
                if(column%2==0)findRow += 1;
                break;
            case EDirection.BOT_LEFT:
                findCol -= 1;
                if(column%2==1)findRow -= 1;
                break;
            case EDirection.TOP_RIGHT:     
                findCol += 1;
                if(column%2==0)findRow += 1;
                break;
            case EDirection.BOT_RIGHT:
                findCol += 1;
                if(column%2==1)findRow -= 1;
                break;     
            default:
                break;
        }
        let position = {row: findRow, column : findCol};
        return position;
    },

    //@return : a cc.Size
    calculateRangeGenHexa(){
        let side = 3;
        while(side*side < this.numberHexagons * 1.5 && side < this.realSizePlay.width && side < this.realSizePlay.height){
            ++side;
        }
        console.log("Range side : " + side);
        return cc.size(side,side);
    },

    generateGridPosition(){
        //calculate size hexagon
        let measureScreenSide = this.node.width < this.node.height ? this.node.width : this.node.height;
        let measurePlaySide = (this.realSizePlay.width > this.realSizePlay.height ? this.realSizePlay.width : this.realSizePlay.height) + 1;
        this.sizeHexagonOnBoard = cc.size(measureScreenSide / measurePlaySide, measureScreenSide / measurePlaySide);

        //create grid
        this.grid.length = 0;
        let halfWidth = this.realSizePlay.width / 3.0; //3 because this is hexagon
        let halfHeight = this.realSizePlay.height / 1.5;

        let distanceX = this.sizeHexagonOnBoard.width * 0.75 + this.marginBetweenHexa * 2;
        let distanceY = this.sizeHexagonOnBoard.height*0.5 + this.marginBetweenHexa;
        let distance2Row = this.sizeHexagonOnBoard.height + this.marginBetweenHexa * 2;

        let startX = this.pointCenterPlayBoard.x - halfWidth * this.sizeHexagonOnBoard.width - this.marginBetweenHexa * halfWidth;
        let startY = this.pointCenterPlayBoard.y - halfHeight * this.sizeHexagonOnBoard.height - this.marginBetweenHexa * halfHeight;
        let x = startX, y = startY;
        let numberRows = ~~this.realSizePlay.height;
        for(let row = 0; row < numberRows; ++row){
            this.grid.push(new Array);
            for(let column = 0; column < this.realSizePlay.width; ++column){
                if(row < numberRows || column%2==1 || !this.ignoreFinal){
                    let py = (column % 2 == 0) ? y : y - distanceY;
                    this.grid[row].push(cc.v2(x, py));
                }else{
                    this.grid[row].push(null);
                }
                x += distanceX;
            }
            y+= distance2Row;
            x = startX;
        }
    },

    suffleArray(array){
        for (let i = array.length - 1; i > 0; i--) {
            const j = ~~(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];    //swap
        }
        return array;
    },

    //@Return : list hexagon object
    isPieceFit(piece){
        let findHexagonNearVec2Position = (position , distanceFit) =>{
            try{
                for(let hexPos of this.listPositionAvaiable){
                    let readlPosition = this.grid[hexPos.row][hexPos.column];
                    if(readlPosition.sub(position).mag() <= distanceFit){
                        for(let group of this.listHexagonsGroup){
                            let result = group.getHexagonAt(hexPos.row, hexPos.column);
                            if(result!=null)return result;
                        }
                        return null;
                    }
                }
            }catch(error){}
            return null;
        };

        let listHexa = [];
        for(let i = 0; i < piece.blocks.length; ++i){
            let blockPos = this.convertToCanvasPosition(piece.blocks[i].parent, piece.blocks[i].position);
            let hexagon = findHexagonNearVec2Position(blockPos, this.sizeHexagonOnBoard.width / 2 - 10);
            if(hexagon && hexagon.block == null)listHexa.push(hexagon);
        }
        if(listHexa.length == piece.blocks.length && piece.blocks.length > 0){
            return listHexa;
        }
        listHexa.length = 0;
   
        return [];     
    },

    releasePieceFromHexagon(piece){
        this.listHexagonsGroup.forEach(group =>{
            if(piece.blocks.length > 0)
                group.releaseBlockOnHexa(piece.blocks[0].getComponent(cc.Sprite).spriteFrame);
        }, this);
    },

    setToNewHexagons(piece, listHexagons){
        piece.positionInGameBoard = this.convertToCanvasPosition(listHexagons[0].node.parent, listHexagons[0].node.position);
        for(let i = 0; i < listHexagons.length; ++i){
            listHexagons[i].block = piece.blocks[i];
        }
        //shadow
        let sprite = piece.blocks[0].getComponent(cc.Sprite);
        if(sprite){
            listHexagons.forEach(hexa =>{
                hexa.setShadow(sprite.spriteFrame);
            });
        }

    },

    hideAllShadow(){
        this.listHexagonsGroup.forEach(group =>{
            group.hexagons.forEach(hexagon =>{
                hexagon.hideShadow();
            });
        });
    },

    convertToCanvasPosition(parentNode, position){
        let checkPos = parentNode.convertToWorldSpaceAR(position);
        return this.node.convertToNodeSpaceAR(checkPos);
    },

    getRandom(min, max){
        return ~~(Math.random() * (max - min + 1) + min);
    }
});
