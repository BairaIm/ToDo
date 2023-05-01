'use strict';

(function() {
    // Global
    const todoList = document.getElementById('todo-list');
    const userSelect = document.getElementById('user-todo');
    const form = document.querySelector('form');
    let todos = [];
    let users = [];
    
    // Attache Events
    document.addEventListener('DOMContentLoaded', initApp);
    form.addEventListener('submit', handleSubmit);
    
    // Basic Logic
    function getUserName(userId) {
        const user = users.find(u => u.id === userId);
        return user.name;
    }
    
    function createUserOption(user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.innerText = user.name;
        userSelect.append(option);
    }
    
    function printTodo({userId, id, title, completed}) {
        const li = document.createElement('li');
        li.className = 'todo-list__item';
        li.dataset.id = id;
    
        const text =  document.createElement('p');
        text.className = 'todo-list__text';
        text.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(Number(userId))}</b>.</span>`;
        li.append(text);
    
        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.className = 'todo-list__input';
        status.addEventListener('change', handleTodoChange);
        li.prepend(status);
    
        const btnDelete = document.createElement('span');
        btnDelete.innerHTML = '&#10006;';
        btnDelete.className = 'todo-list__del';
        btnDelete.addEventListener('click', handleDelete);
        li.append(btnDelete);
    
        todoList.prepend(li);
    }
    
    
    function removeTodo(todoId) {
        todos = todos.filter(todo => todo.id !== todoId);
    
        const todo = todoList.querySelector(`[data-id="${todoId}"]`);
        todo.querySelector('input').removeEventListener('change', handleTodoChange);
        todo.querySelector('span').removeEventListener('click', handleDelete);
    
        todo.remove();
    }
    
    function alertError(error) {
        alert(error.message);
    }
    
    //Event Logic
    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then( values => {
            [todos, users] = values
    
            // Отправить в разметку
            todos.forEach(todo => printTodo(todo));
            users.forEach(user => createUserOption(user));
        })
    }
    
    function handleSubmit(event) {
        event.preventDefault();
    
        createTodo({
            userId: Number(form.user.value),
            title: form.todo.value,
            completed: false
        })
    }
    
    function handleTodoChange() {
        const todoId = this.parentElement.dataset.id;
        const completed = this.checked;
    
        toggleTodoComleted(todoId, completed);
    }
    
    function handleDelete() {
        const todoId = this.parentElement.dataset.id;
        deleteTodo(todoId);
    }
    
    // Async Logic
    async function getAllTodos() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            const data = await response.json();
        
            return data;       
        } catch (error) {
            alertError(error);
        }
    }
    
    async function getAllUsers() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
        
            return data;       
        } catch (error) {
            alertError(error);
        }
    }
    
    async function createTodo(todo) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            const newTodo = await response.json();
        
            printTodo(newTodo);
        } catch (error) {
            alertError(error);
        }
    }
    
    async function toggleTodoComleted(todoId, completed) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: 'PATCH',
                body: JSON.stringify({completed}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to connect with the server! Please try later!')
            }
        } catch (error) {
            alertError(error);
        }
    
    }
    
    async function deleteTodo(todoId) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            if (response.ok) {
                removeTodo(todoId);
            } else {
                throw new Error('Failed to connect with the server! Please try later!')
            }
        } catch (error) {
            alertError(error);
        }
    }
})()