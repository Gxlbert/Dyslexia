//HANDLES WORD FORMATTING

//Global variables
var finalOutput = "";   //concatinated onto by concatOutput() function, holds final result
var currentWord = "";   //stores word currently being formatted

var boundChar = "*";    //character that bounds words

var syllPosition = 0;   //0: word start      1: word middle      2: word end
var lastLetter = "";    //save last letter from most recent syllable

var colorFactor = 0;    //used by concatOutput() to determine color of concatinated syllable

    //Called on window load
//Sets up button
function onLoad() {
    Bformat = document.getElementById("format");

    //document.addEventListener('paste', allowPaste, true);
    Bformat.addEventListener("click", formatInput, false);
}

    //Main function
//Extracts input
//Sends it to formatWord() function
//Prints output after finishing
function formatInput() {
    try {
        var Input = document.getElementById("inputarea").value;
        var lineOutput = "";
        
        var arr0 = Input.split("\n");

        //loop through each line
        for (var line in arr0) {
            //alert(arr0[line]);
            var arr1 = arr0[line].split(" ");
            
            //loop through each word
            for (var word in arr1) {
                //stars to highlight first/last syllables
                formatWord( boundChar + arr1[word] + boundChar );
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
    } catch(e) {
        document.getElementById("outputarea").innerHTML = e.message;
    }
}

    //Indirectly recursive function
//Splits each word into syllables
//Sends each syllable to concatOutput()
function formatWord( word ) {
    //Start new Syllable

    var currentSyll = getCurrentSyllable( word );
    if (currentSyll !== undefined)
        recurseWordFunc(currentSyll, word);
}

//Helper function
//Indirect Recursion here with formatWord() function
function recurseWordFunc(syllable, word) {

    concatSyllable( syllable );

    if (syllPosition == 0)
        word = word.substr(syllable.length + 1);
    else
        word = word.substr(syllable.length);

    if (word != "")
        formatWord(word);
}


//-------------------------------------------------------------------------------//
// TODO ::  Implement "getCurrentSyllable()" to recognize characters that aren't //
//      letters and send them to "ConctatSyllable()" as seperate syllables       //
//-------------------------------------------------------------------------------//

//Helper function
//Concatenates syllables onto output string
//Respects class (color) distribution
//Uses global variable to check color
// Expects a single syllable, of a specific type
// Type: letters or particle (ex: , . / ; etc..)
function concatSyllable( syllable ) {

    var lettersArr = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ؤ", "أ", "آ", "ء", "ئ", "ة","ل","ى","إ"];

    var isLetter;
    isLetter = lettersArr.includes(syllable[0]);

    if ( isLetter ) {
        syllable = checkForLink( syllable );

        //register last letter of current syllable
        lastLetter = syllable.substr(syllable.length - 2, 1);

        colorSyll( colorFactor );            
        currentWord += syllable + "</span>";
        colorFactor++;

    } else {
        currentWord += "<span class='blue'>" + syllable + "</span>";
    }

                //nested function
    //specifies color of syllable only
    function colorSyll( factor ) {

        //case first word has الـ
        if (factor < 0)
            factor = 0;

        //color syllable
        if (factor % 2 == 0)
                currentWord += "<span class='red'>";
            else
                currentWord += "<span class='black'>";
    }

}

    //Helper function
//returns next syllable to be worked with
function getCurrentSyllable( word ) {

    // If start or middle of word
    if ( word[0] == boundChar ) {
        word = word.substr(1);
        syllPosition = 0;
    } else syllPosition = 1;

    var isLong;
    if (checkForAl(word) == 0)
        isLong = checkNextCharIfLong( word, 0 );    //If no AL, start from first letter
    else
        isLong = checkNextCharIfLong( word, 2 );    //If AL, skip it and start from first letter after it

    var endIndex;

    if (isLong) {
        endIndex = caseLongSound( word );
    } else {
        endIndex = caseNotLongSound( word );
    }

    if (syllPosition == 2) {
        word = word.substr(0, word.length - 1);
        return word;
    }
    
    if (endIndex != -1)
        return word.substr(0, endIndex);
}

function caseLongSound( word ) {

    // Sets start position in word
    var currIndex = checkForAl( word );

    // Take Al el taarif if amari
    if (currIndex == -1)
        return 2;

    //alert(word + "     " + currIndex);
    
    if ( !checkIfCharIsMharrak( word, currIndex ) ) {
        // Because substr() is exclusive, move two letters and
        // return index of letter after the syllable

        currIndex = findNextChar( word, currIndex );
        if ( (word[currIndex+1] != null) ) {
            currIndex = findNextChar( word, currIndex );
            return currIndex;
        } else {
            return -1;
        }
    } else {
        if ( (word[currIndex+1] != null) ) {
            currIndex = findNextChar( word, currIndex );

            if ( word[currIndex+1] != "ْ" )
                return currIndex;   //CLC
            else {
                currIndex = findNextChar( word, currIndex );
                return currIndex; //CLCC
            }
        } else return -1;
    }
}

function caseNotLongSound( word ) {

    // Sets start position in word
    var currIndex = checkForAl( word );

    // Take Al el taarif if amari
    if (currIndex == -1)
        return 2;

    if ( (word[currIndex+1] != null) ) {
        currIndex = findNextChar( word, currIndex );

        if ( word[currIndex+1] != "ْ" )
            return currIndex;   //CV

        else {
            if ( (word[currIndex+1] != null) ) {
                currIndex = findNextChar( word, currIndex );

                if ( word[currIndex+1] != "ْ" )
                    return currIndex;   //CVC
                else {
                    currIndex = findNextChar( word, currIndex );
                    return currIndex; //CVCC
                }
            } else return -1;
        }
    } else return -1;
}

    //Helper function
//Checks for Al el taarif
function checkForAl( word ) {

    var Chamsia = ["ث", "ت", "ن", "ل", "ظ", "ط", "ض", "ص", "ش", "س", "ز", "ر", "ذ", "د"];

    if ( word[0] + word[1] == "ال") {
        if ( Chamsia.includes(word[2]) ) return 2;  // Chamsi
        else return -1;                             // Amari
    } else return 0;

}

    //Helper function
//Checks found character type
function checkNextCharIfLong( word, index ) {

    var longSounds = ["ا", "و", "ي", "ى","آ"];

    var charAt = findNextChar( word, index );

    if ( longSounds.includes(word[charAt]) ) {
        return true;
    } else {
        return false;
    }

}

    //Helper function
//Checks if letter has a Harake
function checkIfCharIsMharrak( word, index ) {

    var isMharrak = false;
    var Haraket = ["َ","ُ","ِ"];

    if ( Haraket.includes(word[index+1]) )
        isMharrak = true;

    return isMharrak;

}

    //Helper function
//Find next character after given index
function findNextChar( word, startIndex ) {

    var index = startIndex;
    var lettersArr = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ؤ", "أ", "آ", "ء", "ئ", "ة","ل","ى","إ"];

    while ( ( index + 1 ) < word.length ) {
        if ( !lettersArr.includes(word[index + 1]) )
            //If at end of word
            if (word[index+1] == boundChar) {
                syllPosition = 2;
                index--;
                break;
            } else
                index++;
        else {
            index++;
            break;
        }
    }

    return index;

}

    //Helper function
//Links letters
function checkForLink( syllable ) {
    //Case الـ:
    if (syllable.indexOf("ال") != -1 && syllPosition == 0 && syllable.indexOf("ى") == -1)
        syllable = syllable + "ـ";
    else {
        var Index1 = ["ا","أ","إ","و","ؤ","ر","د","ز","ذ","ى","ة","آ","ؤ","'",".",",",":",";","?","!"];

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

        //special case
        if ( str == "إلى" || str == "إِلَىْ" )
            return str;

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

window.addEventListener("load", onLoad, false);
