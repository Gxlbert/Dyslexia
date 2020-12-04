//HANDLES WORD FORMATTING

//Global variables
var finalOutput = "";   //concatinated onto by concatOutput() function, holds final result

var currentWord = "";   //stores word currently being formatted
var isLetter = true;

var syllPosition = 0;   //0: word start-Link left     1: word mid-Link both sides     2: word end-Link right
var lastLetter = "";    //save last letter from most recent syllable

var colorFactor = 0;    //used by concatOutput() to determine color of concatinated syllable

    //Called on window load
//Sets up button
function onLoad() {
    Bformat = document.getElementById("format");

    //var allowPaste = function(e) {
    //    e.stopImmediatePropagation();
    //    return true;
    //};

    //document.addEventListener('paste', allowPaste, true);
    Bformat.addEventListener("click", formatInput, false);
}

    //Main function
//Extracts input
//Sends it to formatWord() function
//Prints output after finishing
function formatInput() {
    var Input = document.getElementById("inputarea").value;
    var lineOutput = "";
    
    var arr0 = Input.split("\n");

    //loop through each line
    for (var line in arr0) {
        var arr1 = arr0[line].split(" ");

        //loop through each word
        for (var word in arr1) {
            if (arr1[word] == "")
                continue;
            syllPosition = 0;
            formatWord(arr1[word]);
            lineOutput += currentWord + " ";
            currentWord = "";
        }
        
        lineOutput += "<br>";
        finalOutput += lineOutput;
        lineOutput = "";
    }

    document.getElementById("outputarea").innerHTML = finalOutput;

    //Value Resets
    colorFactor = 0;
    finalOutput = "";
    Input = "";
}

    //Indirectly recursive function
//Splits each word into syllables
//Sends each syllable to concatOutput()
function formatWord( word ) {
    //Check for duplicate:
    if (word.indexOf("ّ") != -1) {
        word = removeDuplicate(word);
    }
    //Start new Syllable
    //Special case first
    
    var currentSyll = getCurrentSyllable(word);
    recurseWordFunc(currentSyll, word);
}

//Helper function
//Indirect Recursion here
function recurseWordFunc(syllable, word) {
    if (isLetter && (!checkIfLetter(word.substr(syllable.length)) || (word.substr(syllable.length) == "")) && syllPosition != 0)
        syllPosition = 2;
    concatSyllable(syllable, word);
    word = word.substr(syllable.length);
    if (syllPosition != 2)  //if at end of word, keep it that way
        syllPosition = 1;
    if (word != "")
        formatWord(word);
}

//Helper function
//Concatenates syllables onto output string
//Respects class (color) distribution
//Uses global variable to check color
function concatSyllable( syllable, word ) {
    if (isLetter) {
        syllable = checkForLink( syllable );

        //Special case if word is only one syllable
        if (syllPosition == 0 && syllable.length == 5 && syllable.charAt(syllable.length - 2) == "ْ" && word.substr(syllable.length) == "")
            syllable = syllable.substring(0, syllable.length - 1);

        //register last letter of current syllable
        lastLetter = syllable.substr(syllable.length - 2, 1);
        
        if (colorFactor % 2 == 0)
            currentWord += "<span class='red'>";
        else
            currentWord += "<span class='black'>";
        
        currentWord += syllable + "</span>";
        colorFactor++;
    } else {
        currentWord += "<span class='blue'>" + syllable + "</span>";
        isLetter = true;
    }
}

    //Helper function
//returns next syllable to be worked with
function getCurrentSyllable( word ) {
    
    //Case letter
    if (checkIfLetter(word)) {
        if ( checkSyllType(word[0] + word[1]) == "CV" ) {
            //If CV && not end of word
            if (word.length > 1) {
                //if CV:
                if ( checkSyllType(word[2] + word[3]) == "CV" ) {
                    //end syllable at previous CV
                    return word.substr(0, 2);
                }
                //if C:
                else if ( checkSyllType(word[2] + word[3]) == "C" ) {
                    //If CVC && not end of word
                    if (word.length > 3) {
                        if ( checkSyllType(word[4] + word[5]) == "C" ) {
                            //CVCC 
                            if (word.length > 5) //not end of word
                                return word.substr(0, 6);
                            else                 //end of word
                                return word.substr(0, 6);
                        } else {
                            //CVC 
                            return word.substr(0, 4);
                        }
                    } else { //If CVC && end of word
                        return word.substr(0, 4);
                    }
                }
                //if V: (CL)
                else if ( checkSyllType(word[2] + word[3]) == "V" ) {
                    //If CL && not end of word
                    if (word.length > 3) {
                        //if CV:
                        if ( checkSyllType(word[4] + word[5]) == "CV" ) {
                            //CL
                            return word.substr(0, 4);
                        }
                        //if C
                        else if ( checkSyllType(word[4] + word[5]) == "C" ) {
                            //If CLC && not end of word
                            if (word.length > 5) {
                                //if C:
                                if ( checkSyllType(word[6] + word[7]) == "C" ) {
                                    //CLCC
                                    if (word.length > 7) //not end of word
                                        return word.substr(0, 8);
                                    else                 //end of word
                                        return word.substr(0, 8);
                                } else {
                                    return word.substr(0, 6); //CLC
                                }
                            } else //If CLC && end of word
                                return word.substr(0, 6); //CLC
                        }
                        //if V
                        else if ( checkSyllType(word[4] + word[5]) == "V" ) {
                            return word.substr(0, 6); //CLV
                        } else { //If CL && end of word
                            return word.substr(0, 6);
                        }
                    }
                }
            } else { //if CV && end of word
                return word.substr(0, 2);
            }
        //Case C at start if word
        } else {
    
            if ( checkSyllType(word[0] + word[1] + word[2]) == "CC1" )
                return word.substr(0);
            else
                switch (checkSyllType(word[0] + word[1])) {
                case "C":
                    return word.substr(0, 2);
                case "CC2":
                    return word.substr(0, 2);
                case "CC3":
                    return word.substr(0, 3);
                case "CC4":
                    return word.substr(0, 1);
                }
        }
    } else {
        isLetter = false;
        return word.substr(0, 1);
    }
}

    //Helper function
//Links letters
function checkForLink( syllable ) {
    //Case الـ:
    if (syllable.indexOf("ال") != -1 && syllPosition != 2)
        syllable = syllable + "ـ";
    else {
        var Index1 = ["ا","أ","و","ؤ","ر","د","ز","ذ","ى","ة","آ","ؤ"];

        if (syllPosition == 0) {            //Case: start of word
            syllable = linkAfter( syllable );
        } else if (syllPosition == 1) {     //Case: middle of word
            syllable = linkAfter( syllable );
            syllable = linkBefore( syllable );            
        } else if (syllPosition == 2) {        //Case: end of word
            syllable = linkBefore( syllable );
        }
    }

        //Nested Function
    function linkBefore( str ) {
        var doLink = true;
        
        //special case
        if (str == "الى")
            return str;

        for (var i in Index1) {
            if (Index1.indexOf(lastLetter) != -1){
                //Don't link
                doLink = false;
                break;
            }
        }
        if (doLink)  //Link
            return "ـ" + str;
        return str;
        
    }

        //Nested Function
    function linkAfter( str ) {
        //Checking for last letter if NOT of Index1[]
        for (var i in Index1) {
            if (Index1.indexOf(str.substr(-2, 1)) == -1) {
                return str + "ـ";
            }
        }
        return str;
    }

    return syllable;
}

//Helper function
//Removes "Chadde" from word
//Duplicates constonant
function removeDuplicate( word ) {
    var i = word.indexOf("ّ");        //find index
    var C = word.charAt(i - 1);      //extract C

    var parts = word.split("ّ");      //split word
    parts[0] += "ْ" + C;              //concatinate word with duplicate

    return parts[0]+parts[1];        //return full word
}

//Helper function
//Checks syllable type
function checkSyllType( syllable ) {
if (syllable[1] == "ْ") {
        if (syllable[0] == "ا" || syllable[0] == "و" || syllable[0] == "ي") {
            return "V";
        } else {
            return "C";
        }
    } else {
        if (syllable == "الى")
            return "CC1";
        else if (syllable == "ال")           //case الـ 
            return "CC2";
        else if (syllable[1] == "ا")    //case الـ + حرف
            return "CC3";
        else if (syllable[0] == "آ")
            return "CC4";
        else
            return "CV";
    }
}

    //Helper function
//Checks if first character of current word is a letter
function checkIfLetter(word) {

    var letters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ؤ", "أ", "آ", "ء", "ئ", "ة","ل","ى","إ"];
    var charIsLetter = false;

    for (var char in letters) {
        if (word[0] == letters[char]) {
            charIsLetter = true;
            break;
        }
    }

    //alert(word + "  " + word[0] + "  " + charIsLetter);

    return charIsLetter;

}

window.addEventListener("load", onLoad, false);