import css from './styles/index.scss';

const githubApiEndP = "https://api.github.com/search/users?q=";
const qualifier = "+in:login+type:user";
const accessToken = "&access_token=5043c7c18640d944574997664169002734113759";
const minChars = 2; // the minimum number of characters to start making ajax requests
let autoCompleteXHR = new XMLHttpRequest();
let selectedUser = false; // global - defaultly there are no selected users
let usersMax; // global - length of the users list

let gitUsersList = document.getElementById('gitusers-list');
document.getElementById('user-input').addEventListener("keyup", event => autoComplete(event));
document.addEventListener("keydown", event => keyDownHandle(event));

function autoComplete(event) {
	// check if input was alphanumeric or backspace or delete and the whole input is larger than minimum characters
	if(((event.which >= 48 && event.which <= 90) || (event.which === 8 || event.which === 46)) && event.target.value.length > minChars){
		getUsersAjax(event.target.value);
	// if input is backspace or delete and the whole input is smaller than minimum characters
	} else if((event.which === 8 || event.which === 46) && event.target.value.length <= minChars){
		emptyList();
	}
}

function getUsersAjax(userInput){
	autoCompleteXHR.abort();
	autoCompleteXHR.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			let usersJson = JSON.parse(this.responseText); 
			buildUsersList(usersJson);
		}
	};
	autoCompleteXHR.open("GET", githubApiEndP + userInput + qualifier + accessToken, true);
	autoCompleteXHR.send();
}

function buildUsersList(usersJson){
	emptyList();
	usersMax = usersJson.items.length;
	usersJson.items.forEach((gitUser,index) => {
        let option = document.createElement('div');
        option.setAttribute("data-index", index + 1);
        option.addEventListener("mouseover", hoverUser, true);
        option.innerHTML = `
        	<a href="${gitUser.html_url}" target="_blank">
        	<span class="gitusers-avatar"><img src="${gitUser.avatar_url}"></span>
        	<span class="gitusers-name">${gitUser.login}</span></a>`;
        gitUsersList.appendChild(option);
    });
}

function emptyList(){
	gitUsersList.innerHTML = "";
	selectedUser = false;
}

function keyDownHandle(event){
	if((event.which === 38) && (gitUsersList.innerHTML.length > 0)){
		selectUser('up');
	} else if((event.which === 40) && (gitUsersList.innerHTML.length > 0)){
		selectUser('down');
	} else if((event.which === 13) && (gitUsersList.innerHTML.length > 0)){
		let toHighLight = document.querySelector(`[data-index="${selectedUser}"]`);
		window.open(toHighLight.childNodes[1].href);
	}
}

function selectUser(direction){
	// if this is the first selection, select the first user in the list
	if(selectedUser === false){
		selectedUser = 1;
		highLightUser();
		return;
	}
	// moving up in the list
	if(direction === 'up'){
		// can't go further up the list
		if(selectedUser === 1){
			return;
		} else {
			selectedUser--;
			highLightUser();
		}
	// moving down in the list
	} else if(direction === 'down'){
		// can't further down the list
		if(selectedUser === usersMax){
			return;
		} else {
			selectedUser++;
			highLightUser();
		}
	}
}

function highLightUser(){
	// remove the "selector" class from previously selected element
	var removeClassArr = document.querySelector(".selectedGitUser");
	if(removeClassArr) {
		removeClassArr.classList.remove("selectedGitUser");
	}
	// add "selector" class to newly selected element
	let dataIndex = `[data-index="${selectedUser}"]`;
	let toHighLight = document.querySelector(`[data-index="${selectedUser}"]`);
	toHighLight.classList.add("selectedGitUser");
}

function hoverUser(event){
    selectedUser = event.currentTarget.getAttribute('data-index');
    highLightUser();
}
