// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
export const EDirection = cc.Enum({
    TOP: 0,
    BOT: 1,
    TOP_LEFT: 2,
    BOT_LEFT: 3,
    TOP_RIGHT: 4,
    BOT_RIGHT: 5,
    COUNT: 6     
});

var Range = require('./Range');

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
            default: null,
            visible: false
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
        hole:{
            default: null,
            type: cc.SpriteFrame
        },
        numberHoles:{
            type: Range,
            default: null,
            visible: false
        },
        numberPieces : {
            type: Range,
            default: null,
            visible: false
        },
        numberBlockEachPieces : {
            type: Range,
            default: null,
            visible: false
        },
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad(){
        this.actionHandler = this.node.getChildByName('ActionHandler').getComponent('ActionHandler');
    },

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
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{this.isGenerating = false;}, this)));
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
        this.generatePiece();
        this.putPiecesToSelectionBar();
    },

    nextLevel(){
        let levelChild = this.node.getChildByName('LevelManager');
        if(levelChild){
            let level = levelChild.getComponent('LevelManager').nextLevel();
            this.totalNumberHexagons.set(level.difficult.totalBlocks);
            this.numberPieces.set(level.difficult.pieces);
            this.numberBlockEachPieces.set(level.difficult.piecesBlocks);
            this.numberHoles = new Range();
            this.numberHoles.set(level.difficult.numberHoles);
            this.rateHole = level.difficult.rateHole;
        }
    },

    reset(){
        if(!this.isGenerating){
            this.isGenerating = true;
            this.node.getChildByName('FunctionHandler').getComponent('FunctionHandler').history.length = 0;
            this.node.getChildByName('SelectionBar').getComponent('SelectionBar').clear();
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
        let selectionBar = this.node.getChildByName('SelectionBar');
        if(selectionBar){
            let barCom = selectionBar.getComponent('SelectionBar');
            if(barCom){
                for(let group of this.listHexagonsGroup){
                    for(let piece of group.pieces){
                        piece.positionInGameBoard = cc.v2(9999,9999);
                        this.actionHandler.scalePiece(piece, this.actionHandler.selectionScale);
                        barCom.push(piece.getComponent('Piece'));
                    }
                    for(let hexa of group.hexagons){
                        hexa.block = null;
                    }
                }
                barCom.resize();
            }
        }
    },

    generatePiece(){
        function pieceCreation(){
            this.numberBlocks = 0;
            this.type = 0;
            this.piecePositions = [];
        };
        let arrayPieceCreations = [];
        //get number pieces
        let numberPieces = this.getRandom(this.numberPieces.min, this.numberPieces.max);
        for(let i = 0; i < numberPieces; ++i){
            arrayPieceCreations.push(new pieceCreation());
            arrayPieceCreations[arrayPieceCreations.length - 1].type = this.blockTypes[i];
        }
        cc.log("Number Piece : " + numberPieces);
        //get number blocks each piece : get value to arrayPieceCreations
        {
            let numberHexagonsTemp = this.numberHexagons;
            let maxBlocks = this.numberBlockEachPieces.max;
            let minBlocks = this.numberBlockEachPieces.min;
            for(let i = 0; i < numberPieces - 1; i++){
                let numberBlocks = minBlocks;
                if(numberHexagonsTemp > maxBlocks){
                    let blocksForOthers = (numberPieces - i - 1) * minBlocks;
                    let subAvailable = numberHexagonsTemp - maxBlocks - blocksForOthers;
                    if(subAvailable < 0){
                        numberBlocks = this.getRandom(minBlocks, maxBlocks + subAvailable);
                    }else{
                        numberBlocks = this.getRandom(minBlocks, maxBlocks);
                    }
                }else{
                    numberBlocks = this.getRandom(minBlocks, numberHexagonsTemp);
                }
                arrayPieceCreations[i].numberBlocks = numberBlocks;
                numberHexagonsTemp -= numberBlocks;
            }
            arrayPieceCreations[numberPieces - 1].numberBlocks = numberHexagonsTemp;
        }
        for(let piece of arrayPieceCreations)cc.log("Block each Piece : " + piece.numberBlocks);
        //get grid available to put block : out put to gridAvaiable
        let gridAvaiable = [];
        {
            let rangerVertical = new Range(), rangerHorizontal = new Range();
            rangerVertical.min = this.positionStartGenHexa.row - this.rangeGenerateHexa.height / 2;
            rangerVertical.max = this.positionStartGenHexa.row + this.rangeGenerateHexa.height / 2;
            rangerHorizontal.min = this.positionStartGenHexa.column - this.rangeGenerateHexa.width / 2;
            rangerHorizontal.max = this.positionStartGenHexa.column + this.rangeGenerateHexa.width / 2;

            for(let row = 0; row < this.realSizePlay.height; row++)
                if(row >= ~~rangerVertical.min && row <= rangerVertical.max)
                    for(let column = 0; column < this.realSizePlay.width; column++)
                        if(column >= ~~rangerHorizontal.min && column <= rangerHorizontal.max)
                            gridAvaiable.push({row, column});
        }

        let positionAvailable = (row, column) =>{
            return gridAvaiable.findIndex(element =>{
                return element.row == row && element.column == column;
            });
        };
        let getRandomInArray = array =>{
            return array[~~(Math.random() * array.length)];
        };
        let getPositionAround = (row, column) =>{
            let result = [];
            for(let i = 0; i < EDirection.COUNT; i++){
                let position = this.getHexagonPosAtDirection(i, row, column);
                let index = positionAvailable(position.row, position.column);
                if(index != - 1)result.push(index);
            }
            return result;
        };
        //generate blocks
        //start of each piece
        for(let i = 0; i < numberPieces; i++){
            if(i == 0){
                let center = positionAvailable(~~this.positionStartGenHexa.row, ~~this.positionStartGenHexa.column);
                arrayPieceCreations[i].piecePositions.push(gridAvaiable[center]);
                arrayPieceCreations[i].numberBlocks--;
                gridAvaiable.splice(center, 1);
            }else{
                let randomPiece = arrayPieceCreations[~~(Math.random() * i)];
                let firstBlockPos = randomPiece.piecePositions[0];
                let around = getPositionAround(firstBlockPos.row, firstBlockPos.column);
                if(around.length > 0){
                    let randomIndex = getRandomInArray(around);
                    arrayPieceCreations[i].piecePositions.push(gridAvaiable[randomIndex]);
                    arrayPieceCreations[i].numberBlocks--;
                    gridAvaiable.splice(randomIndex, 1);
                }
            }
        }
        //full of each piece
        while(true){
            let isFinished = true;
            for(let creation of arrayPieceCreations){
                if(creation.numberBlocks > 0 && creation.piecePositions.length > 0){
                    let randomStart = getRandomInArray(creation.piecePositions);
                    let around = getPositionAround(randomStart.row, randomStart.column);
                    if(around.length > 0){
                        let randomIndex = getRandomInArray(around);
                        creation.piecePositions.push(gridAvaiable[randomIndex]);
                        creation.numberBlocks--;
                        gridAvaiable.splice(randomIndex, 1);
                        isFinished = false;
                    }
                }
            }
            if(isFinished)break;
        }

        //for hole..
        {
            let numberHoles = this.getRandom(this.numberHoles.min, this.numberHoles.max);
            if(numberHoles > 0 && this.rateHole > 0){
                if(~~(Math.random() * 100) <= this.rateHole){
                    let posForHole = [];
                    let getSameTypesArond = (row, column, arraySameType) =>{
                        let around = getPositionAround(row, column);
                        let count = 0;
                        if(around >= EDirection.COUNT){
                            for(let pos of around){
                                let find = arraySameType.findIndex(ele =>{return ele.row == pos.row && ele.column == pos.column;});
                                if(find != -1)count++;
                            }
                        }
                        return count;
                    };
                    let createHoleRandArray = () =>{
                        let randomIndex = ~~(Math.random() * posForHole.length);
                        let position = posForHole[randomIndex];
                        createBlockAtPos(position.row, position.column, this.hole);
                        posForHole.splice(randomIndex, 1);
                    };
                    for(let creation of arrayPieceCreations){
                        if(creation.piecePositions.length > this.numberBlockEachPieces.min){
                            creation.piecePositions = this.suffleArray(creation.piecePositions);
                            for(let i = 0; i < creation.piecePositions.length; i++){
                                let start = creation.piecePositions[i];
                                if(getSameTypesArond(start.row, start.column, creation.piecePositions) >= 3){
                                    posForHole.push(start);
                                    break;
                                }
                            }
                        }
                    }
                    if(posForHole.length > 0){
                        createHoleRandArray();
                        for(let i = 1; i < numberHoles; i++)
                            if(~~(Math.random() * 100) <= this.rateHole) createHoleRandArray();
                    }
                }
            }
        }
        
        //create blocks
        this.listHexagonsGroup.length = 0;
        for(let groupI = 0; groupI < this.numberHexagonsGroup; groupI++){
            let group = cc.instantiate(this.hexagonGroupPrefab);
            let groupCom = group.getComponent('HexagonGroup');
            this.listHexagonsGroup.push(groupCom);
            for(let createI = 0; createI < arrayPieceCreations.length; createI++){
                let piece = cc.instantiate(this.piecePrefab);
                let pieceCom = piece.getComponent('Piece');
                this.node.addChild(piece, 1);
                groupCom.pieces.push(pieceCom);
                for(let pos of arrayPieceCreations[createI].piecePositions){
                    //hexagon
                    let hexagon = this.createHexagonsAt(pos.row, pos.column);
                    groupCom.push(hexagon);
                    let block = this.createBlockAtPos(pos.row, pos.column, this.blockTypes[createI % this.blockTypes.length]);
                    pieceCom.pushBlock(block);
                    let hexagonCom = hexagon.getComponent('Hexagon');
                    hexagonCom.block = block;
                }
            }
        }

        
    },

    //@Return : a node object which contains Block component
    createBlockAtPos(row, column, spriteFrame){
        let block = cc.instantiate(this.blockPrefab);
        block.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        block.setPosition(this.grid[row][column]);
        block.setContentSize(this.sizeHexagonOnBoard.width, this.sizeHexagonOnBoard.height);
        this.node.addChild(block, 1);
        return block;
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
                    this.node.addChild(hexagon, 0);
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

    //@return : a object with row and column
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
        return cc.size(side,side);
    },

    generateGridPosition(){
        //calculate size hexagon
        console.log(`Screen : ${this.node.width} - ${this.node.height}`);
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
