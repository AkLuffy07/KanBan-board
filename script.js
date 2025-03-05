const addTaskBtn = document.getElementById('addTask-todo');
const todoCards = document.querySelector('#todo');
const addBoardBtn = document.getElementById('addBoard');
const cardContainer = document.querySelector('.card-container');
const container = document.querySelector('.container');

let boardsFetched = [];


const staticBoards = [
    { name: 'Todo', desc: 'To be done', count: 0, color: '#2679d1' },
    { name: 'In Progress', desc: 'Being worked on', count: 0, color: '#e6cd12' },   
    { name: 'Done', desc: 'Completed', count: 0, color: '#15ad22' }
]

const localStorageData = {
    getBoards: () => {
        const boards = localStorage.getItem('boards');
        return boards ? JSON.parse(boards) : [];
    },
    setBoards: async (boards, slug) => {
        boardsFetched = JSON.parse(localStorage.getItem('boards')) || [];

        if(boardsFetched?.length > 0) {
            console.log("boardsFetched", boardsFetched);
            
            const boardAvailable = boardsFetched.find(board => board.slug === slug);
            console.log("boardAvailable ::", boardAvailable);
            
            if(boardAvailable) {
                console.log("boardAvailable (if)", boardAvailable);
                const boardIndex = boardsFetched.findIndex(board => board.slug === slug);                
                boardsFetched[boardIndex] = { boards, slug };
            } else {
                boardsFetched.push({ boards, slug });
            }
        } else {
            boardsFetched.push({ boards, slug });
        }

        console.log("boardsFetched", boardsFetched);

        localStorage.setItem('boards', JSON.stringify(boardsFetched));
        
        
        
        // console.log("availableBoards", availableBoards);
        
    }
}

function createBoard(board) {
    const boardSlug = board.name.toLowerCase().trim().replace(/ /g, "-");
    let boardElement;

    const getBoardsFromLocal = localStorageData.getBoards();

    const boardIndex = getBoardsFromLocal.findIndex(board => board.slug === boardSlug);

    boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.setAttribute('id', boardSlug);
    if(boardIndex !== -1) {
        boardElement.innerHTML = getBoardsFromLocal[boardIndex]?.boards;
    } else {
        boardElement.innerHTML = `
            <div class="board-header">
                <div class="board-title">
                    <div class="color" style="background-color: ${board.color}"></div>
                    <h4>${board.name}</h4>
                    <span class="count">${board.count}</span>
                </div>
                <p>${board.desc}</p>
                <div class="option">
                    <img width="20px" src="./assets/dots.svg" alt="dots">
                </div>
            </div>
            <div class="taskBtn">
                <button id="${boardSlug}-addTask" class="add-task">Add Task +</button>
            </div>
        `;
    }
    
    cardContainer.appendChild(boardElement);

    const fetchCards = boardElement.querySelectorAll('.card');
    if(fetchCards.length > 0) {
        fetchCards.forEach(card => {
            editCard(card, boardElement);
            deleteCard(card, boardElement);
        })
    }

    const addNewTaskBtn = document.getElementById(`${boardSlug}-addTask`);
    
    addTaskToBoard(addNewTaskBtn, boardElement);

    const optionClick = boardElement.querySelector('.option');
    
    optionClick.addEventListener('click', () => {
        console.log("Cliked");
        let menu = boardElement.querySelector('.menu');
        console.log("menu ::", menu);

        if(menu) {
            menu.classList.toggle('hidden');
        } else {

            menu = document.createElement('div');
            menu.classList.add('menu');

            menu.innerHTML += `
                <ul>
                    <li id="${boardSlug}-edit">Edit</li>
                    <li id="${boardSlug}-delete">Delete</li>
                </ul>
            `
            boardElement.appendChild(menu);
    
            const deleteBoard = document.getElementById(`${boardSlug}-delete`);
            deleteBoardInMenu(deleteBoard, boardElement);
    
            const editBoard = document.getElementById(`${boardSlug}-edit`);
            editBoardInMenu(editBoard, boardElement);
        }

    })

    // const getBoardsFromLocal = localStorageData.getBoards();

    // const boardIndex = getBoardsFromLocal.findIndex(board => board.slug === boardSlug);
    console.log("NewBoard :: ", boardElement);
    
    
    localStorageData.setBoards(boardElement.innerHTML, boardSlug)

    // if(boardIndex !== -1) {
    //     console.log("Add board from local");
    // } else {
    //     localStorageData.setBoards(boardElement.innerHTML, boardSlug);
    // }
    

    dragOverOnBoard(boardElement);
}

function deleteBoardInMenu(target, board) {
    
    target.addEventListener('click', () => {
        const confirmationDialog = confirm('Are you sure you want to delete this board?');
        if(!confirmationDialog) {
            return;
        }
        board.remove();
    })
}

function editBoardInMenu(target, board) {
    target.addEventListener('click', () => {
        genericModalForBoard(board, true);
        // const boardName = prompt('Enter board name');
        // const boardDesc = prompt('Enter board description');
        // if(!boardName || !boardDesc) {
        //     alert('Board name & description is required');
        //     board.querySelector('.menu').remove();

        //     return;
        // }
        // board.querySelector('h4').textContent = boardName;
        // board.querySelector('p').textContent = boardDesc;

        board.querySelector('.menu').remove();
        
    })
}


function dragOverOnBoard(target) {
    target.addEventListener('dragover', () => {
        const draggedCard = document.querySelector('.dragging');
        target.appendChild(draggedCard);
        const allBoard = document.querySelectorAll('.board');
        allBoard.forEach(board => {
            updateCount(board);
        })
    })
}

function dragEvent(target) {
    target.addEventListener('dragstart', () => {
        target.classList.add('dragging');
    })

    target.addEventListener('dragend', () => {
        target.classList.remove('dragging');
        const allBoards = document.querySelectorAll('.board');
        allBoards.forEach(board => {
            localStorageData.setBoards(board.innerHTML, (board.querySelector('h4').textContent)?.toLowerCase()?.trim()?.replace(/ /g, "-"));
        })
    })
}

function genericModalForTask(targetCard, targetBoard, isEdit) {
    console.log("targetCard", targetCard);
    console.log("targetBoard", targetBoard);
    
    
    const taskName = targetCard.querySelector('h5')?.textContent || "";
    const taskDesc = targetCard.querySelector('p')?.textContent || "";
    const allBoards = document.querySelectorAll('.board');
    allBoards.forEach(board => {
        board.classList.add('blur');
    })
    console.log("allBoards", allBoards);
    
    addBoardBtn.classList.add('blur');
    const taskModal = document.createElement('div');
    taskModal.classList.add('task-modal');
    taskModal.innerHTML = `
        <div class="taskModal-header">
            <h3>${isEdit ? "Edit Task" : "Add Task"}</h3>
            <div class="close" id="close">X</div>
        </div>
        <div class="taskInputSection">
            <label for="taskName">Name</label>
            <input value="${taskName}" type="text" id="taskName" placeholder="Task Name">
        </div>
        <div class="taskInputSection">
            <label for="taskDesc">Description</label>
            <input value="${taskDesc}" type="text" id="taskDesc" placeholder="Task Description">
        </div>
        <div class="taskModal-footer">
            <button class="addTaskModal">${isEdit ? "Update Task" : "Add Task"}</button>
        </div>
    `;

    container.appendChild(taskModal);

    const close = taskModal.querySelector('#close');
    close.addEventListener('click', () => {
        taskModal.remove();
        allBoards.forEach(board => {
            board.classList.remove('blur');
        })
        addBoardBtn.classList.remove('blur');
    })

    const addTaskModal = taskModal.querySelector('.addTaskModal');
    addTaskModal.addEventListener('click', () => {
        if(!isEdit) {
            const taskName = taskModal.querySelector('#taskName').value;
            const taskDesc = taskModal.querySelector('#taskDesc').value;

            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('draggable', true);
            card.innerHTML = `
            <h5>${taskName}</h5>
            <p>${taskDesc}</p>
            <div class="modifyTask">
                <button class="delete-task">
                    <img width="15px" src="./assets/delet-icon.svg" alt="dots">
                </button>
                <button class="edit-task">
                    <img width="15px" src="./assets/edit-icon.svg" alt="dots">
                </button>
            </div>
            `;
            dragEvent(card);
            targetBoard.appendChild(card);
            deleteCard(card, targetBoard);
            editCard(card, targetBoard);
            updateCount(targetBoard);
            taskModal.remove();
            allBoards.forEach(board => {
                board.classList.remove('blur');
            })
            addBoardBtn.classList.remove('blur');
            localStorageData.setBoards(targetBoard.innerHTML, (targetBoard.querySelector('h4').textContent)?.toLowerCase()?.trim()?.replace(/ /g, "-"));

        } else {
            const taskName = targetCard.querySelector('h5');
            const taskDesc = targetCard.querySelector('p');
            taskName.textContent = taskModal.querySelector('#taskName').value;
            taskDesc.textContent = taskModal.querySelector('#taskDesc').value;
            taskModal.remove();
            allBoards.forEach(board => {
                board.classList.remove('blur');
            })
            addBoardBtn.classList.remove('blur');
            localStorageData.setBoards(targetBoard.innerHTML, (targetBoard.querySelector('h4').textContent)?.toLowerCase()?.trim()?.replace(/ /g, "-"));
        }
    })
}

function genericModalForBoard(targetBoard, isEdit) {
    const boardName = targetBoard?.querySelector('h4')?.textContent || "";
    const boardDesc = targetBoard?.querySelector('p')?.textContent || "";
    let boardColor = targetBoard?.querySelector('div .color')?.style?.backgroundColor || "";
    const allBoards = document.querySelectorAll('.board');
    allBoards.forEach(board => {
        board.classList.add('blur');
    })
    addBoardBtn.classList.add('blur');
    const boardModal = document.createElement('div');
    boardModal.classList.add('board-modal');
    boardModal.innerHTML = `
        <div class="boardModal-header">
            <h3>${isEdit ? "Edit Board" : "Add Board"}</h3>
            <div class="close" id="close">x</div>
        </div>
        <div class="boardInputSection">
            <label for="boardName">Name</label>
            <input value="${boardName}" type="text" id="boardName" placeholder="Board Name">
        </div>  
        <div class="color-pick">
            <label for="boardColor">Color</label>
            <div class="color-pane">
                <span value="#ff0000" class="color"></span>
                <span value="#008000" class="color"></span>
                <span value="#0000ff" class="color"></span>
                <span value="#ffff00" class="color"></span>
                <span value="#000000" class="color"></span>
                <span value="#bf09ec" class="color"></span>
            </div>
        </div>
        <div class="boardInputSection">
            <label for="boardDesc">Description</label>
            <input value="${boardDesc}" type="text" id="boardDesc" placeholder="Board Description">
        </div>
        <div class="boardModal-footer">
            <button class="addBoardModal">${isEdit ? "Update Board" : "Add Board"}</button>
        </div>
    `;

    container.appendChild(boardModal);

    const colors = container.querySelectorAll('.color-pane span');
    colors.forEach(color => {
        color.addEventListener('click', () => {
            colors.forEach(color => {
                color.style.outline = 'none';
            })
            boardColor = color.getAttribute('value');
            color.style.outline = '3px solid rgb(12, 228, 228)';
        })
    })

    const close = boardModal.querySelector('#close');
    close.addEventListener('click', () => {
        boardModal.remove();
        allBoards.forEach(board => {
            board.classList.remove('blur');
        })
        addBoardBtn.classList.remove('blur');
    })

    const addBoardModal = boardModal.querySelector('.addBoardModal');
    addBoardModal.addEventListener('click', () => {
        const boardName = boardModal.querySelector('#boardName').value;
        const boardDesc = boardModal.querySelector('#boardDesc').value;
        if(!isEdit) {
            if(!boardName || !boardDesc) {
                alert('Board name and description are required');
                return;
            }

            createBoard({
                name: boardName,
                desc: boardDesc,
                count: 0,
                color: boardColor
            });
            boardModal.remove();
            allBoards.forEach(board => {
                board.classList.remove('blur');
            })
            addBoardBtn.classList.remove('blur');
        } else {
            targetBoard.querySelector('h4').textContent = boardName;
            targetBoard.querySelector('p').textContent = boardDesc;
            targetBoard.querySelector('div .color').style.backgroundColor = boardColor;
            boardModal.remove();
            allBoards.forEach(board => {
                board.classList.remove('blur');
            })
            addBoardBtn.classList.remove('blur');
        }
    })
}

function addTaskToBoard(targetCard, targetBoard) {

    targetCard.addEventListener('click', () => {
        genericModalForTask(targetCard, targetBoard, false);
        // const taskName = prompt('Enter task name');
        // const taskDesc = prompt('Enter task description');
        
        // if(!taskName || !taskDesc) {
        //     alert('Task name and description are required');
        //     return;
        // }        
        
    })
}

function editCard(targetCard, targetBoard) {
    const editTask = targetCard.querySelector('.edit-task');
    
    editTask.addEventListener('click', () => {
        genericModalForTask(targetCard, targetBoard, true);
    })
}

function deleteCard(targetCard, targetBoard) {
    const deleteTask = targetCard.querySelector('.delete-task');
    deleteTask.addEventListener('click', () => {
        console.log("Delete task");
        
        const confirmationDialog = confirm('Are you sure you want to delete this task?');
        if(!confirmationDialog) {
            return;
        }
        targetCard.remove();
        const allBoard = document.querySelectorAll('.board');
        allBoard.forEach(board => {
            updateCount(board);
        })
        localStorageData.setBoards(targetBoard.innerHTML, (targetBoard.querySelector('h4').textContent)?.toLowerCase()?.trim()?.replace(/ /g, "-"));
    })
}

function updateCount(targetBoard) {
    const cardCount = targetBoard.querySelectorAll('.card').length;
    targetBoard.querySelector('.count').textContent = cardCount;
    
}

(function staticBoardFetch() {
    const boards = localStorageData.getBoards();
    if(boards?.length > 0) {        
        boards.forEach(board => {
            const newEle = document.createElement('div');
            newEle.innerHTML = board.boards;
            const boardName = newEle.querySelector('h4').textContent;
            const boardDesc = newEle.querySelector('p').textContent;
            const count = newEle.querySelector('.count').textContent;
            const color = newEle.querySelector('div .color').style.backgroundColor;

            createBoard({
                name: boardName,
                desc: boardDesc,
                count: count,
                color: color
            });
            
            // createBoard(JSON.parse(board));
        })
    } else {
        staticBoards.forEach(board => {
            createBoard(board);
        })
    }
})();

// staticBoards.forEach(board => {
//     createBoard(board);
// })

addBoardBtn.addEventListener('click', () => {
    genericModalForBoard(null, false);
})


// addTaskToBoard(addTaskBtn, todoCards);

const allCards = document.querySelectorAll('.card');
const allBoards = document.querySelectorAll('.board');

allCards.forEach(card => {
    dragEvent(card);
})

allBoards.forEach(board => {
    dragOverOnBoard(board);
})


const taskBtn = document.querySelector('.taskBtn');
console.log(taskBtn);


