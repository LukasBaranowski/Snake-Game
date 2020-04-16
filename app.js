/******************GAME ENGINE***************/

//Create a new object of the game and initialize start function. When the page finished loading
window.onload = () => {
    let G = new Game();
    G.start();
}

//Main game class
class Game {
    constructor () {
        this.data = this.prepare ();
        //avoiding the too fast button clicks - the snake won't turn back if changign direction too fast
        this.keydown = false;
        //Sanke control. listening for buttons
        document.addEventListener("keydown", (event) => {
            let e = event || window.event;
            let snake = this.data.snake;
            //chceking for which buttons are pressed 37 - left, 38 - up, 39 - right, 40 - down
            //And check for orientation so the snake doesn't turn back and eat it's tail
            if(!this.keydown) {
                if(e.keyCode == 37 && snake.mvD!="x") {
                    this.keydown = true;
                    //if left arrow pressed we change oreintation to x and speed to -1
                    snake.mvD = "x";
                    snake.mvS = -1;
                } else if(e.keyCode == 38 && snake.mvD!="y") {
                    this.keydown = true;
                    snake.mvD = "y";
                    snake.mvS = -1;
                } else if(e.keyCode == 39 && snake.mvD!="x") {
                    this.keydown = true;
                    snake.mvD = "x";
                    snake.mvS = 1;
                } else if(e.keyCode == 40 && snake.mvD!="y") {
                    this.keydown = true;
                    snake.mvD = "y";
                    snake.mvS = 1;
                }
            }
            
        });
    }

    //start function begins new interval that repeats every 100ms which is 10 frames per second
    start () {
        this.tm = setInterval(() => {
            //this.keydown doen't allow to press buttons too fast.
            this.keydown = false;
            //at each new frame of the interval there will be three functions initialized
            //1. checking for collision
            this.checkCollision();
            //2. checking the position
            this.updata();
            //3. drawing new canvas
            this.redraw();
        }, 200);
    }
    //1. checking the position. Moving the snake
    //Last element is moving to the place of the next one
    updata() {
        let snake = this.data.snake;
        //The array of the snake parts must be reversed and itereated through
        //The arr argument is the current array that the loop is working on. it will be used in the middle of the function
        snake.seg.reverse().forEach((cseg, i, arr) => {
            //Checking for the movement orientation
            if(snake.mvD === "x") {
                //checking if it's the first segment of snake or not
                if( i == arr.length - 1) {
                    //if yes then we move the head of the snake to the next position x that equals the value of it'a speed
                    cseg.x += snake.mvS;
                } else {
                    //if not then we move the head of the snake to the next position with the index +1
                    cseg.x = snake.seg[i+1].x;
                    cseg.y = snake.seg[i+1].y;
                }
            //for the vertical orientation must be done the same but with position y
            } else {
                if( i == arr.length - 1) {
                    //if yes then we move the head of the snake to the next position x that equals the value of it'a speed
                    cseg.y += snake.mvS;
                } else {
                    //if not then we move the head of the snake to the next position with the index +1
                    cseg.x = snake.seg[i+1].x;
                    cseg.y = snake.seg[i+1].y;
                }
            }

            //The walls don't kill. the snake goes to the other side if hit the wall.
            //If the current position x is bigger than the width of canvas/50 -1 then the segment of the snake must be thrown to the position zero

            if(cseg.x > this.data.cvs.width / 50 -1) {
                cseg.x = 0;
            }
            //If the position is smaller than the width then the snake must be thrown to the other side of canvas
            if(cseg.x < 0) {
                cseg.x = this.data.cvs.width / 50 -1;
            }
            //Same with the vertical orientation
            if(cseg.y > this.data.cvs.height / 50 -1) {
                cseg.y = 0;
            }
            if(cseg.y < 0) {
                cseg.y = this.data.cvs.height / 50 -1;
            }
        });
        //Snake segments must come back to the normal order
        snake.seg.reverse();
        //if the position of the fruit was not generated but there is still space then create a new fruit which position will be generated correctly
        if(this.data.fruit.g == false && snake.seg.length < (this.data.cvs.width / 50) * this.data.height / 50) {
            //Creates new fruit
            this.data.fruit = new Fruit(this.data.cvs.width / 50 - 1, this.data.cvs.height / 50 - 1, snake.seg);
        }
    }
    //2. checking for collision
    checkCollision() {
        let snake = this.data.snake;
        let fruit = this.data.fruit;
        //When thee snake's head will be at the same position as fruit then add the piece of snake to the segment array
        if(snake.seg[0].x == fruit.x && snake.seg[0].y == fruit.y) {
            snake.seg.push({x: snake.seg[snake.seg.length - 1].x, y: snake.seg[snake.seg.length-1].y});
            //Create new fruit
            this.data.fruit = new Fruit(this.data.cvs.width / 50 - 1, this.data.cvs.height / 50 - 1, snake.seg);
        }

        //Check all the snake segments with the forEach loop
        snake.seg.forEach((cseg, i) => {
            //if the position of the current segment will be the same as the position of the head and the current segment is not the head then the segment array will be shoretened to the place of collision
            if (snake.seg[0].x == cseg.x && snake.seg[0].y == cseg.y && i > 0) {
                snake.seg = snake.seg.splice(0, i+1);
            }

        });

    }
    //3. drawing new canvas
    redraw() {
        let ctx = this.data.ctx;
        let img = this.data.img;
        let fruit = this.data.fruit;
        let snake = this.data.snake;

        //Before drawing new frame previous frame must be deleted.
        //Can be done by covering it with drawImage canvas method
        ctx.drawImage(img.bg, 0, 0);

        //drawing fruit with the random shape 't' size and position at which it will be drawn
        //(x,y,width,height)
        //'50' is the size of one tile of the board
        ctx.drawImage(img.fr, fruit.t * 50, 0, 50, 50, fruit.x * 50, fruit.y * 50, 50, 50);

        //draw the snake. All the elements must be iterated with the forEach loop.
        //cseg ==> current segment
        snake.seg.forEach((cseg, i, arr) => {
            
            //Check for the snake parts
            if( i == 0 ) {
                //if the current seg is first there is no any previous one available but next one which will be assigned to new varaible nseg ==> next segment
                let nseg = snake.seg [i+1];
                //4 conditions for the snakes head direction
                //1. Head right
                if(cseg.x - nseg.x == 1 || /*so head appears in first tile*/ cseg.x - nseg.x < -1) {
                    ctx.drawImage(img.sn, 200, 50, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //2.Head left
                } else if (cseg.x - nseg.x == -1 || cseg.x - nseg.x > 1) {
                    ctx.drawImage(img.sn, 200, 0, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //3.Head down
                } else if (cseg.y - nseg.y == 1 || cseg.y - nseg.y < -1) {
                    ctx.drawImage(img.sn, 150, 0, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //4.Head up
                } else if (cseg.y - nseg.y == -1 || cseg.y - nseg.y > 1) {
                    ctx.drawImage(img.sn, 150, 50, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                }

            } else if (i == arr.length - 1) {
                //Tail drawing. pseg variable ==> previous segment
                let pseg = snake.seg[i-1];

                    //Tail right
                if(cseg.x - pseg.x == 1 || cseg.x - pseg.x < -1) {
                    ctx.drawImage(img.sn, 50, 100, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                    //Tail left
                } else if (cseg.x - pseg.x == -1 || cseg.x - pseg.x > 1) {
                    ctx.drawImage(img.sn, 150, 100, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                    //Tail up
                } else if (cseg.y - pseg.y == 1 || cseg.y - pseg.y < -1) {
                    ctx.drawImage(img.sn, 100, 100, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                    //Tail down
                } else if (cseg.y - pseg.y == -1 || cseg.y - pseg.y > 1) {
                    ctx.drawImage(img.sn, 0, 100, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                }
                //Drwing the rest of the body
            } else {
                let nseg = snake.seg[i+1];
                let pseg = snake.seg[i-1];
                //Body horizontal
                if( (cseg.x - nseg.x == 1 && cseg.x - pseg.x == -1) ||
                    (cseg.x - pseg.x == 1 && cseg.x - nseg.x == -1) ||
                    (cseg.x - nseg.x <= -1 && cseg.x - pseg.x <= -1)||
                    (cseg.x - nseg.x >= 1 && cseg.x - pseg.x >= 1)) {
                        ctx.drawImage(img.sn, 50, 50, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //Body vertical
                } else if( (cseg.y - nseg.y == 1 && cseg.y - pseg.y == -1) ||
                            (cseg.y - pseg.y == 1 && cseg.y - nseg.y == -1) ||
                            (cseg.y - nseg.y <= -1 && cseg.y - pseg.y <= -1)||
                            (cseg.y - nseg.y >= 1 && cseg.y - pseg.y >= 1)) {
                                ctx.drawImage(img.sn, 50, 0, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                // Body turn from left side of the board to up and from up to left
                } else if ( (cseg.x - nseg.x == 1 && cseg.y - pseg.y == 1) ||
                            (cseg.x - pseg.x == 1 && cseg.y - nseg.y == 1) ||
                            (cseg.x - nseg.x == 1 && cseg.y - pseg.y < -1) ||
                            (cseg.x - pseg.x == 1 && cseg.y - nseg.y < -1) ||
                            (cseg.x - nseg.x < -1 && cseg.y - pseg.y == 1) ||
                            (cseg.x - pseg.x < -1 && cseg.y - nseg.y == 1)) {
                                ctx.drawImage(img.sn, 100, 50, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //Turn from left to down and from down to left
                } else if ( (cseg.x - nseg.x == 1 && cseg.y - pseg.y == -1) ||
                            (cseg.x - pseg.x == 1 && cseg.y - nseg.y == -1) ||
                            (cseg.x - nseg.x == 1 && cseg.y - pseg.y > 1) ||
                            (cseg.x - pseg.x == 1 && cseg.y - nseg.y > 1) ||
                            (cseg.x - nseg.x < -1 && cseg.y - pseg.y == -1) ||
                            (cseg.x - pseg.x < -1 && cseg.y - nseg.y == -1)) {
                                ctx.drawImage(img.sn, 100, 0, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //Turn from up to right and from right to up
                } else if ( (cseg.x - nseg.x == -1 && cseg.y - pseg.y == 1) ||
                            (cseg.x - pseg.x == -1 && cseg.y - nseg.y == 1) ||
                            (cseg.x - nseg.x == -1 && cseg.y - pseg.y < -1) ||
                            (cseg.x - pseg.x == -1 && cseg.y - nseg.y < -1) ||
                            (cseg.x - nseg.x > 1 && cseg.y - pseg.y == 1) ||
                            (cseg.x - pseg.x > 1 && cseg.y - nseg.y == 1)) {
                                ctx.drawImage(img.sn, 0, 50, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50);
                //Turn from down to right and from right to down
                } else if ( (cseg.x - nseg.x == -1 && cseg.y - pseg.y == -1) ||
                            (cseg.x - pseg.x == -1 && cseg.y - nseg.y == -1) ||
                            (cseg.x - nseg.x == -1 && cseg.y - pseg.y > 1) ||
                            (cseg.x - pseg.x == -1 && cseg.y - nseg.y > 1) ||
                            (cseg.x - nseg.x > 1 && cseg.y - pseg.y == -1) ||
                            (cseg.x - pseg.x > 1 && cseg.y - nseg.y == -1)) {
                                ctx.drawImage(img.sn, 0, 0, 50, 50, cseg.x * 50, cseg.y * 50, 50, 50); 
                }

            }

            /*//SIMPLE VERSION OF THE SNAKE DRAWING
            ctx.fillStyle = "#fff";
            ctx.fillRect(cseg.x * 50, cseg.y * 50, 50, 50)*/

        });
    }

    prepare() {
        let _cvs = document.getElementById("C1");
        //context llows to draw in canvas
        let _ctx = _cvs.getContext("2d");
        // The Image() constructor creates a new HTMLImageElement instance. It is functionally equivalent to document.createElement('img')
        let bgImage = new Image();
        bgImage.src = "background.png";
        bgImage.addEventListener('load', () => {
            bgImage = this;
        });

        let snImage = new Image();
        snImage.src = "snakeV2.png";
        snImage.addEventListener('load', () => {
            snImage = this;
        });

        let frImage = new Image();
        frImage.src = "viruses.png";
        frImage.addEventListener('load', () => {
            frImage = this;
        });
        //Here will be inserted Snake Object
        let _snake = new Snake(4,5);
        //First fruit that will appear on the map
        //This class will set the max farthest position that the fruit can appear in. The last argument is the position of the snake 
        let _fruit = new Fruit(_cvs.width / 50 - 1, _cvs.height / 50 - 1, _snake.seg);

        //Insert elements into the data container
        let data = {
            cvs: _cvs,
            ctx: _ctx,
            img: {
                bg: bgImage,
                sn: snImage,
                fr: frImage
            },
            snake: _snake,
            fruit: _fruit
        }
        //returning all the data from the prepare function
        return data;
    }
}

class Fruit {
    constructor(max_x, max_y, seg) {
        // this.g contains info if the position of the fruit has been generated
        this.g = false
        //Call the position generating function
        this.genPosition(max_x, max_y, seg);
        //Random number for the type of the fruit which are 3
        this.t = Math.floor(Math.random() * 3);
    }
    //Make sure the fruit doesn't appear on the tail of the snake

    //Setting the position of the fruit with the function generating it's position with three arguments: size of the map x and y and the array with the snake parts
    genPosition(max_x, max_y, seg) {
        //make sure if there's still space for the fruit on the map.
        if (seg.length < (max_x + 1)*(max_y+1)) {
            //if there is still space choosing the random position on x and y from 0 to max width 'x' and max height 'y'
            let pos = {x: Math.floor(Math.random() * max_x), y: Math.floor(Math.random() * max_y)};

            let collide = false;
            //Checking if the fruit collides with the snake
            //some method determines whether the specified callback function returns true for any element of an array.
            seg.some((cseg) => {
                if(cseg.x == pos.x && cseg.y == pos.y) {
                    collide = true;
                    return true;
                }
            });

            //If varaible collide will be true the fruit position must be cosen again
            if(collide) {
                this.genPosition(max_x, max_y, seg);
            //If not then assign the chosen position to varaibles x and y
            } else {
                this.x = pos.x;
                this.y = pos.y;
                //position has been generated so 'g' can be true
                this.g = true;
            }


        } else {
            this.g = false;
        }
            
        

    }

}

class Snake {
    //Starting Position x y
    constructor(x,y) {
        //Array that will keep the pieces/parts of the snake
        this.seg = [];
        // 4parts of the snake 
        for (let i=0 ; i < 4; i++) {
            //each consecutive piece will be an Object that has position 'x' decreased by a number of iterations of the loop and the 'y' position that is taken from constructor
            this.seg[i] = {x: x - i, y: y};
        };
        //Snake movement orientation
        this.mvD = "x";
        //Snake speed
        this.mvS = 1;
    }
}




















