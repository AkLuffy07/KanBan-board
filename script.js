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
        return JSON.parse(localStorage.getItem('boards')) || [];
    },

    setBoards: async (boards, slug) => {
        const boardsFetched = JSON.parse(localStorage.getItem('boards')) || [];
        
        const boardIndex = boardsFetched.findIndex(board => board.slug === slug);
        if (boardIndex !== -1) {
            // Update existing board
            boardsFetched[boardIndex] = { boards, slug };
        } else {
            // Add new board
            boardsFetched.push({ boards, slug });
        }
        localStorage.setItem('boards', JSON.stringify(boardsFetched));
    },

    deleteBoard: async (slug) => {
        let boardsFetched = JSON.parse(localStorage.getItem('boards')) || [];
        boardsFetched = boardsFetched.filter(board => board.slug !== slug);
        localStorage.setItem('boards', JSON.stringify(boardsFetched));
    }
};

function createBoard(board, slug = "") {
    const boardSlug = slug || board.name.toLowerCase().trim().replace(/ /g, "-");
    const getBoardsFromLocal = localStorageData.getBoards();
    const boardIndex = getBoardsFromLocal.findIndex(board => board.slug === boardSlug);

    const boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.setAttribute('id', boardSlug);

    boardElement.innerHTML = boardIndex !== -1 ? getBoardsFromLocal[boardIndex]?.boards : generateBoardHTML(board, boardSlug);
    cardContainer.appendChild(boardElement);

    boardElement.querySelectorAll('.card').forEach(card => {
        editCard(card, boardElement);
        deleteCard(card, boardElement);
    });

    const addNewTaskBtn = document.getElementById(`${boardSlug}-addTask`);
    addTaskToBoard(addNewTaskBtn, boardElement);
    setupBoardMenu(boardElement, boardSlug);

    localStorageData.setBoards(boardElement.innerHTML, boardSlug)
    dragOverOnBoard(boardElement);
}

function generateBoardHTML(board, boardSlug) {
    return `
        <div class="board-header">
            <div class="board-title">
                <div class="color" style="background-color: ${board.color}"></div>
                <h4 slug="${boardSlug}">${board.name}</h4>
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

setupBoardMenu = (boardElement, boardSlug) => {
    const optionClick = boardElement.querySelector('.option');
    
    optionClick.addEventListener('click', () => {
        let menu = boardElement.querySelector('.menu');
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
}

function deleteBoardInMenu(target, board) {
    
    target.addEventListener('click', () => {
        const confirmationDialog = confirm('Are you sure you want to delete this board?');
        if(!confirmationDialog) {
            return;
        }
        board.remove();
        document.querySelectorAll('.menu').forEach(menu => menu.remove());
        localStorageData.deleteBoard(board.querySelector('h4').getAttribute('slug'));

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

        // board.querySelector('.menu').remove();
        
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
            localStorageData.setBoards(board.innerHTML, (board).querySelector('h4').getAttribute('slug'));
        })
    })
}

function genericModalForTask(targetCard, targetBoard, isEdit) {
    const taskName = targetCard.querySelector('h5')?.textContent || "";
    const taskDesc = targetCard.querySelector('p')?.textContent || "";
    const allBoards = document.querySelectorAll('.board');
    allBoards.forEach(board => {
        board.classList.add('blur');
    })
    const menu = document.querySelectorAll('.menu');
    menu.forEach(menu => {
        menu.remove();
    })
    // console.log("allBoards", allBoards);
    
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
    taskModal.querySelector('#taskName').focus();

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
            const currentDate = formatDateTime();

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
            <div class="currentDate">
                <span>${currentDate}</span>
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
            localStorageData.setBoards(targetBoard.innerHTML, targetBoard.querySelector('h4').getAttribute('slug'));

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
            localStorageData.setBoards(targetBoard.innerHTML, targetBoard.querySelector('h4').getAttribute('slug'));
        }
    })
}

function genericModalForBoard(targetBoard, isEdit) {
    const boardName = targetBoard?.querySelector('h4')?.textContent || "";
    const boardDesc = targetBoard?.querySelector('p')?.textContent || "";
    const boardSlug = targetBoard?.querySelector('h4')?.getAttribute('slug') || "";
    let boardColor = targetBoard?.querySelector('div .color')?.style?.backgroundColor || "";
    const allBoards = document.querySelectorAll('.board');
    allBoards.forEach(board => {
        board.classList.add('blur');
    })
    const menu = document.querySelectorAll('.menu');
    menu.forEach(menu => {
        menu.remove();
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
            localStorageData.setBoards(targetBoard.innerHTML, boardSlug);
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
        const confirmationDialog = confirm('Are you sure you want to delete this task?');
        if(!confirmationDialog) {
            return;
        }
        targetCard.remove();
        const allBoard = document.querySelectorAll('.board');
        allBoard.forEach(board => {
            updateCount(board);
        })
        localStorageData.setBoards(targetBoard.innerHTML, targetBoard.querySelector('h4').getAttribute('slug'));
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
            }, board.slug);
            
            // createBoard(JSON.parse(board));
        })
    } else {
        staticBoards.forEach(board => {
            createBoard(board);
        })
    }
})();

formatDateTime = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    console.log(formattedDate);
    
    const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedTime = formatter.format(date);
    return `${formattedDate} ${formattedTime}`
}


addBoardBtn.addEventListener('click', () => {
    genericModalForBoard(null, false);
})


const allCards = document.querySelectorAll('.card');
const allBoards = document.querySelectorAll('.board');

allCards.forEach(card => {
    dragEvent(card);
})

allBoards.forEach(board => {
    dragOverOnBoard(board);
})

