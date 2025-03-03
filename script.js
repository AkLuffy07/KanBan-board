const addTaskBtn = document.getElementById('addTask-todo');
const todoCards = document.querySelector('#todo');
const addBoardBtn = document.getElementById('addBoard');
const cardContainer = document.querySelector('.card-container');

const staticBoards = [
    'Todo', 'In Progress', 'Done'
]

function createBoard(boardName) {
    const boardSlug = boardName.toLowerCase().trim().replace(/ /g, "-");
    const boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.innerHTML = `
        <h4>${boardName}</h4>
        <div class="taskBtn">
            <button id="${boardSlug}" class="add-task">Add Task +</button>
        </div>
    `;
    
    cardContainer.appendChild(boardElement);

    const addNewTaskBtn = document.getElementById(boardSlug);
    
    addTaskToBoard(addNewTaskBtn, boardElement);

    dragOverOnBoard(boardElement);
}


function dragOverOnBoard(target) {
    target.addEventListener('dragover', () => {
        const draggedCard = document.querySelector('.dragging');
        target.appendChild(draggedCard);
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

function addTaskToBoard(targetCard, targetBoard) {
    targetCard.addEventListener('click', () => {
        const taskName = prompt('Enter task name');
        const taskDesc = prompt('Enter task description');

        if(!taskName || !taskDesc) {
            alert('Task name and description are required');
            return;
        }

        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('draggable', true);
        card.innerHTML = `
            <h5>${taskName}</h5>
            <p>${taskDesc}</p>
        `;
        dragEvent(card);
        targetBoard.appendChild(card);
    })
}

staticBoards.forEach(board => {
    createBoard(board);
})

addBoardBtn.addEventListener('click', () => {
    const boardName = prompt('Enter board name');

    if(!boardName) {
        alert('Board name is required');
        return;
    }

    createBoard(boardName);
})


addTaskToBoard(addTaskBtn, todoCards);

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


