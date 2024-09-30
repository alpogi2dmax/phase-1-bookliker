document.addEventListener("DOMContentLoaded", function() {

    let list = document.getElementById('list');
    let showPanel = document.getElementById('show-panel');

    let currentUser = {"id":1, "username":"pouros"};

    console.log(currentUser.username);

    function getAllBooks() {
        fetch('http://localhost:3000/books/') 
        .then(res => res.json())
        .then(bookData => {
            bookData.forEach(book => renderOneBook(book));
        });
    }

    function getAllUsers() {
        fetch('http://localhost:3000/users/') 
        .then(res => res.json())
        .then(userData => {
            userData.forEach(user => renderOneUser(user));
        });
    }

    getAllBooks();

    getAllUsers();

    function renderOneUser(user) {
        let option = document.createElement('option');
        option.id = `${user.id}`;
        option.innerText = `${user.id} ${user.username}`;
        document.querySelector('#user-dropdown').appendChild(option);
    }

    document.querySelector('#user-dropdown').addEventListener('change', (e) => {
        const selectedUserId = parseInt(e.target.value);
        console.log(selectedUserId);
        fetch(`http://localhost:3000/users/${selectedUserId}`)
        .then(res => res.json())
        .then(user => {
            currentUser = user; // Update the currentUser
            console.log(`Current user changed to: ${currentUser.username}`);
        });
    });

    function renderOneBook(book) {
        let li = document.createElement('li');
        li.innerText = `${book.title}`;

        li.addEventListener('click', () =>{
            showPanel.innerHTML = `
            <img src = ${book.img_url}>
            <h2>${book.title}</h2>
            <p>${book.description}</p>
            <ul id="user-likes"></ul>
            <button type="button" id="like-button">Like!</button>
            `;

        let userLikesUl = document.getElementById('user-likes');
        book.users.forEach(user => {
            let userLi = document.createElement('li');
            userLi.innerText = user.username;
            userLikesUl.appendChild(userLi);
        });

        let usersExists = book.users.some(user => user.id === currentUser.id);

        if(usersExists) {
            document.getElementById('like-button').innerText = 'Unlike!'
        }

        document.getElementById('like-button').addEventListener('click', (e) => {

            if(!usersExists) {
                book.users.push(currentUser);
                
                fetch(`http://localhost:3000/books/${book.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ users: book.users }),
                })
                .then(response => response.json())
                .then(updatedBook => {
                    let userLi = document.createElement('li');
                    userLi.innerText = currentUser.username;
                    userLikesUl.appendChild(userLi);
                    usersExists = true;
                    document.getElementById('like-button').innerText = 'Unlike!';
                })
                .catch(error => console.error('Error:', error));
            } else {
                book.users = book.users.filter(user => user.id !== currentUser.id);

                fetch(`http://localhost:3000/books/${book.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ users: book.users }),
                })
                .then(response => response.json())
                .then(updatedBook => {
                    let userLikeItems = document.querySelectorAll('#user-likes li');
                    userLikeItems.forEach(userLi => {
                        if(userLi.innerText === currentUser.username) {
                            userLi.remove();
                        }
                    });
                    usersExists = false;
                    document.getElementById('like-button').innerText = 'Like!';
                })
                .catch(error => console.error('Error:', error));                                
            }
        })

        


    });

        list.appendChild(li);

    
    
    }



});
