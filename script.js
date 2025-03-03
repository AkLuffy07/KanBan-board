const addTaskBtn = document.getElementById('addTask-todo');
const todoCards = document.querySelector('#todo');
const addBoardBtn = document.getElementById('addBoard');
const cardContainer = document.querySelector('.card-container');
const container = document.querySelector('.container');


const staticBoards = [
    { name: 'Todo', desc: 'To be done', count: 0 },
    { name: 'In Progress', desc: 'Being worked on', count: 0 },   
    { name: 'Done', desc: 'Completed', count: 0 }
]

function createBoard(board) {
    const boardSlug = board.name.toLowerCase().trim().replace(/ /g, "-");
    const boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.setAttribute('id', boardSlug);
    boardElement.innerHTML = `
        <div class="board-header">
            <div class="board-title">
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
    
    cardContainer.appendChild(boardElement);

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

        console.log("Final Menu ::", menu);
    })

    dragOverOnBoard(boardElement);
}

function deleteBoardInMenu(target, board) {
    
    target.addEventListener('click', () => {        
        board.remove();
    })
}

function editBoardInMenu(target, board) {
    target.addEventListener('click', () => {
        const boardName = prompt('Enter board name');
        const boardDesc = prompt('Enter board description');
        if(!boardName || !boardDesc) {
            alert('Board name & description is required');
            board.querySelector('.menu').remove();

            return;
        }
        board.querySelector('h4').textContent = boardName;
        board.querySelector('p').textContent = boardDesc;

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
    })
}

function genericModalForTask(targetCard, targetBoard, isEdit) {
    const taskName = targetCard.querySelector('h5')?.textContent || "";
    const taskDesc = targetCard.querySelector('p')?.textContent || "";
    const allBoards = document.querySelectorAll('.board');
    allBoards.forEach(board => {
        board.classList.add('blur');
    })
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
            deleteCard(card);
            editCard(card, targetBoard);
            updateCount(targetBoard);
            taskModal.remove();
            allBoards.forEach(board => {
                board.classList.remove('blur');
            })
            addBoardBtn.classList.remove('blur');
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

function deleteCard(targetCard) {
    const deleteTask = targetCard.querySelector('.delete-task');
    deleteTask.addEventListener('click', () => {
        targetCard.remove();
        const allBoard = document.querySelectorAll('.board');
        allBoard.forEach(board => {
            updateCount(board);
        })
    })
}

function updateCount(targetBoard) {
    const cardCount = targetBoard.querySelectorAll('.card').length;
    targetBoard.querySelector('.count').textContent = cardCount;
    
}


staticBoards.forEach(board => {
    createBoard(board);
})

addBoardBtn.addEventListener('click', () => {
    const boardName = prompt('Enter board name');
    const boardDesc = prompt('Enter board description');

    if(!boardName || !boardDesc) {
        alert('Board name & description is required');
        return;
    }

    createBoard({
        name: boardName,
        desc: boardDesc,
        count: 0
    });
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


