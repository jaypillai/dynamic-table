// Below function Executes on click of login button.
function validate(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    if ( username == 'Admin' && password == 'Admin123'){
        window.location = 'index.html';
        localStorage.setItem('isLoggesIn', 'true');
        return false;
    }
    else{
        document.getElementById('alert').style.display = 'inline'
        return false;
    }
}