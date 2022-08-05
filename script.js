const addButton = document.querySelector('input[type=button]');
const titleInput = document.querySelector('form input[type=text]');
const [monthInput, dayInput] = document.querySelectorAll('form input[type=number]');
const sortButton = document.querySelector(".sort input");
const todoDisplayZone = document.querySelector("section.todo-list");
const TODO_LIST_KEY = "todo-list";

presentInitialTodoList();
addButton.addEventListener('click', addUserTodo);
sortButton.addEventListener('click', sortTodoList);

function presentInitialTodoList() {
    const todoList = loadTodoList();
    todoList.forEach(todo => {
        addTodoView(todo);
    });
}

function addUserTodo() {
    const todoInfo = getUserTodoInfo();
    const correctFormat = checkTodoInfo(todoInfo);
    if (correctFormat) {
        clearInput();
        addTodoIntoStorage(todoInfo);
        addTodoView(todoInfo);
    } else {
        alert("Please input correct data~~");
    }
}

function sortTodoList() {
    sortTodoViewList();
    sortTodoListInStorage();
}

function sortTodoListInStorage() {
    const todoList = loadTodoList();
    const sorted = Array.from(todoList).sort((a, b) => {
        return (a.date.month - b.date.month)
            || (a.date.day - b.date.day);
    });
    localStorage.setItem(TODO_LIST_KEY, JSON.stringify(sorted));
}

function sortTodoViewList() {
    const todoViewList = todoDisplayZone.querySelectorAll('.todo');
    todoDisplayZone.replaceChildren();
    Array.from(todoViewList)
        .sort((a, b) => {
            const t1 = getTodoInfo(a);
            const t2 = getTodoInfo(b);
            return (t1.date.month - t2.date.month)
                || (t1.date.day - t2.date.day);
        })
        .forEach(todo => todoDisplayZone.appendChild(todo));
}

function addTodoIntoStorage(todo) {
    const todoList = loadTodoList();
    todoList.push(todo);
    saveTodoList(todoList);
}

function loadTodoList() {
    const todoListJSON = localStorage.getItem(TODO_LIST_KEY);
    if (!todoListJSON) {
        localStorage.setItem(TODO_LIST_KEY, JSON.stringify([]));
        return [];
    }
    return JSON.parse(todoListJSON);
}

function saveTodoList(todoList) {
    localStorage.setItem(TODO_LIST_KEY, JSON.stringify(todoList));
}

function clearInput() {
    titleInput.value = "";
    monthInput.value = "";
    dayInput.value = "";
}

function getUserTodoInfo() {
    const title = titleInput.value;
    const month = Number(monthInput.value);
    const day = Number(dayInput.value);

    return { title, date: { month, day }, isDone: false };
}

function checkTodoInfo(todoInfo) {
    return todoInfo.title.length !== 0
        && checkDate(todoInfo.date);
}

function checkDate(date) {
    const month = date.month;
    const day = date.day;

    if (Number.isNaN(month) || month < 1 || month > 12) {
        return false;
    }

    return ([1, 3, 5, 7, 8, 10, 12].includes(month) && 1 <= day && day <= 31)
        || ([4, 6, 9, 11].includes(month) && 1 <= day && day <= 30)
        || (1 <= day && day <= 29);
}

function addTodoView(todoInfo) {
    const todo = document.createElement("div");
    todo.classList.add("todo");
    if (todoInfo.isDone) {
        todo.classList.add("done");
    }

    const title = document.createElement("p");
    title.classList.add("todo-title");
    title.innerText = todoInfo.title;

    const date = document.createElement("p");
    date.classList.add("todo-date");
    date.innerText = todoInfo.date.month + " / " + todoInfo.date.day;

    todo.appendChild(title);
    todo.appendChild(date);

    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fa-solid");
    checkIcon.classList.add("fa-check");
    addCheckFunc(checkIcon);

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid");
    trashIcon.classList.add("fa-trash");
    addRemoveFunc(trashIcon);

    const icons = document.createElement("div");
    icons.classList.add("icons");

    icons.appendChild(checkIcon);
    icons.appendChild(trashIcon);

    todo.appendChild(icons);

    todoDisplayZone.appendChild(todo);
}

function addCheckFunc(el) {
    el.addEventListener("click", () => {
        const todo = el.parentElement.parentElement;
        const todoList = loadTodoList();
        todoList.forEach(t => {
            if (deepEqual(t, getTodoInfo(todo))) {
                t.isDone = !t.isDone;
            }
        });
        todo.classList.toggle("done");
        console.log(todoList);
        saveTodoList(todoList);
    });
}

function addRemoveFunc(el) {
    el.addEventListener("click", () => {
        const todo = el.parentElement.parentElement;
        todo.addEventListener("animationend", () => {
            todo.remove();
        });
        const todoList = loadTodoList();
        saveTodoList(todoList.filter((t) => !deepEqual(t, getTodoInfo(todo))));
        todo.style.animation = "scale-down 0.5s ease";
    });
}

function getTodoInfo(todo) {
    const title = todo.querySelector('.todo-title').innerText;
    const date = todo.querySelector('.todo-date').innerText;
    const [monthString, dayString] = date.split('/');
    const month = Number(monthString);
    const day = Number(dayString);
    const isDone = Array.from(todo.classList).includes('done');

    return { title, date: { month, day }, isDone };
}

function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }
    return true;
}
function isObject(object) {
    return object != null && typeof object === 'object';
}
