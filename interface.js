
function start()
{
    document.getElementById("submit").addEventListener("click", button, false);

}

function button()
{
    
    var username, password;
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    
    var usernameDB = ["Admin"];
    var passDB =["dyslexia"];
    
    var index = inDatabase(username, usernameDB);

    if(index != -1)
    {
        if(checkPass(index, password, passDB))
        {
            document.getElementById("submit").href = "software.html";
        }
        else
        {
            document.getElementById("incorrect").innerHTML = "الرّجاء اعادة مراجعة المعلومات";
        }
    }
    else
    {
        document.getElementById("incorrect").innerHTML = "الرّجاء اعادة مراجعة المعلومات";
    }
}

function inDatabase(username, names)
{
    for(var i=0; i<names.length; i++)
    {
        if(username == names[i])
        {
            return i;
        }
    }

    return -1;
}

function checkPass(index, password, pass)
{
    if(password == pass[index])
        return true;
    else
        return false;
}

window.addEventListener("load", start, false);

