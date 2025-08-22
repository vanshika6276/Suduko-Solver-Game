
let originalPuzzle; // stores the initial puzzle for reset

// ===== Utility =====
function deepClone(board){return board.map(r=>r.slice());}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}


// ===== Solver =====
function isSafe(board,r,c,num){for(let i=0;i<9;i++){if(board[r][i]===num||board[i][c]===num)return false;}let sr=r-r%3,sc=c-c%3;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(board[sr+i][sc+j]===num)return false;return true;}
function solveBoard(board){for(let r=0;r<9;r++){for(let c=0;c<9;c++){if(board[r][c]===0){for(let n=1;n<=9;n++){if(isSafe(board,r,c,n)){board[r][c]=n;if(solveBoard(board))return true;board[r][c]=0;}}return false;}}}return true;}
function countSolutions(board){let b=deepClone(board);let count=0;function helper(){for(let r=0;r<9;r++){for(let c=0;c<9;c++){if(b[r][c]===0){for(let n=1;n<=9;n++){if(isSafe(b,r,c,n)){b[r][c]=n;helper();b[r][c]=0;}}return;}}}count++;if(count>1)return;}helper();return count;}


// ===== Generator =====
function generateFull(){let b=Array.from({length:9},()=>Array(9).fill(0));function fill(r,c){if(r===9)return true;let nr=c===8?r+1:r,nc=(c+1)%9;let nums=shuffle([1,2,3,4,5,6,7,8,9]);for(let n of nums){if(isSafe(b,r,c,n)){b[r][c]=n;if(fill(nr,nc))return true;b[r][c]=0;}}return false;}fill(0,0);return b;}
function makePuzzle(full,difficulty){let attempts=40; if(difficulty==="easy") attempts=30; if(difficulty==="medium") attempts=40; if(difficulty==="hard") attempts=50; if(difficulty==="expert") attempts=60; let b=deepClone(full);while(attempts>0){let r=Math.floor(Math.random()*9),c=Math.floor(Math.random()*9);while(b[r][c]===0){r=Math.floor(Math.random()*9);c=Math.floor(Math.random()*9);}let backup=b[r][c];b[r][c]=0;let copy=deepClone(b);if(countSolutions(copy)!==1){b[r][c]=backup;attempts--;} }return b;}


// ===== Game State =====
let puzzle,solution;let selected=null;let notesMode=false;let undoStack=[],redoStack=[];let timerInt;let seconds=0;
//function startNewGame(difficulty){let full=generateFull();solution=deepClone(full);solveBoard(solution);puzzle=makePuzzle(full,difficulty);renderBoard();seconds=0;updateTimer();clearInterval(timerInt);timerInt=setInterval(()=>{seconds++;updateTimer();},1000);document.getElementById("mistakes").textContent="0";document.getElementById("hintsUsed").textContent="0";document.getElementById("filled").textContent="0";document.getElementById("message").textContent="";undoStack=[];redoStack=[];}

function startNewGame(difficulty){
    let full = generateFull();
    solution = deepClone(full);
    solveBoard(solution);
    puzzle = makePuzzle(full, difficulty);
    originalPuzzle = deepClone(puzzle);  // <-- Save copy for reset
    renderBoard();
    
}

function updateTimer(){let m=String(Math.floor(seconds/60)).padStart(2,'0');let s=String(seconds%60).padStart(2,'0');document.getElementById("timer").textContent=`${m}:${s}`;}


// ===== Rendering =====
function renderBoard(){const boardEl=document.getElementById("board");boardEl.innerHTML="";let filled=0;for(let r=0;r<9;r++){for(let c=0;c<9;c++){const cell=document.createElement("div");cell.classList.add("cell");if(puzzle[r][c]!==0){cell.textContent=puzzle[r][c];cell.classList.add("prefilled");}else{cell.dataset.r=r;cell.dataset.c=c;}cell.addEventListener("click",()=>selectCell(r,c));boardEl.appendChild(cell);if(puzzle[r][c]!==0)filled++;}}document.getElementById("filled").textContent=filled;renderNumpad();}
function renderNumpad(){const np=document.getElementById("numpad");np.innerHTML="";for(let n=1;n<=9;n++){const btn=document.createElement("button");btn.textContent=n;btn.onclick=()=>handleInput(n);np.appendChild(btn);}const clr=document.createElement("button");clr.textContent="⌫";clr.onclick=()=>handleInput(0);np.appendChild(clr);}


// ===== Controls =====
function selectCell(r,c){selected={r,c};document.querySelectorAll(".cell").forEach(cell=>cell.classList.remove("selected"));let idx=r*9+c;document.querySelectorAll(".cell")[idx].classList.add("selected");}
function handleInput(num){if(!selected)return;let {r,c}=selected;if(puzzle[r][c]!==0)return;saveState();if(notesMode){const cell=document.querySelectorAll(".cell")[r*9+c];if(!cell.classList.contains("notes")){cell.textContent="";cell.classList.add("notes");for(let i=1;i<=9;i++){let span=document.createElement("span");span.textContent=i;span.style.visibility="hidden";cell.appendChild(span);} }let spans=document.querySelectorAll(".cell")[r*9+c].querySelectorAll("span");if(num>0)spans[num-1].style.visibility=spans[num-1].style.visibility==="hidden"?"visible":"hidden";}else{puzzle[r][c]=num;renderBoard();}}
function saveState(){undoStack.push(deepClone(puzzle));redoStack=[];}


// Buttons
document.getElementById("newGame").onclick=()=>startNewGame(document.getElementById("difficulty").value);
//document.getElementById("reset").onclick=()=>renderBoard();
document.getElementById("reset").onclick = () => {
    puzzle = deepClone(originalPuzzle);  // restore initial puzzle
    renderBoard();
};
document.getElementById("solve").onclick=()=>{puzzle=deepClone(solution);renderBoard();};
document.getElementById("toggleNotes").onclick=()=>{notesMode=!notesMode;document.getElementById("toggleNotes").textContent=`✏️ Notes: ${notesMode?"On":"Off"}`;};
document.getElementById("check").onclick=()=>{for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(puzzle[r][c]!==0&&puzzle[r][c]!==solution[r][c]){document.getElementById("message").textContent="Some entries are wrong!";return;}document.getElementById("message").textContent="So far so good!";};
document.getElementById("hint").onclick=()=>{if(!selected)return;let {r,c}=selected;if(puzzle[r][c]!==0)return;puzzle[r][c]=solution[r][c];renderBoard();let used=+document.getElementById("hintsUsed").textContent+1;document.getElementById("hintsUsed").textContent=used;};
document.getElementById("undo").onclick=()=>{if(undoStack.length>0){redoStack.push(deepClone(puzzle));puzzle=undoStack.pop();renderBoard();}};
document.getElementById("redo").onclick=()=>{if(redoStack.length>0){undoStack.push(deepClone(puzzle));puzzle=redoStack.pop();renderBoard();}};


// Keyboard input
document.addEventListener("keydown",e=>{if(!selected)return;let {r,c}=selected;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){if(e.key==="ArrowUp"&&r>0)selectCell(r-1,c);if(e.key==="ArrowDown"&&r<8)selectCell(r+1,c);if(e.key==="ArrowLeft"&&c>0)selectCell(r,c-1);if(e.key==="ArrowRight"&&c<8)selectCell(r,c+1);}if("123456789".includes(e.key))handleInput(+e.key);if(["Backspace","Delete","0"].includes(e.key))handleInput(0);if(e.key.toLowerCase()==="n")notesMode=!notesMode;});


// Start default game
startNewGame("medium");