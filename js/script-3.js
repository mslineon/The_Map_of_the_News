
"use strict";

let scene = "title"; 

let bgImg;

const voiceOutput = new p5.Speech(); // Speech synthesis class
// speech synth is called "rita" in the rest of the code
voiceOutput.onEnd = ritaSayNextWord; // set callback for  when rita finishes saying a word
voiceOutput.interrupt = true; // allow new words to interrupt rita
voiceOutput.setRate(1.4);
let ritaWillSay = []; // queue for what rita will say
let ritaSaid = []; // output list of what rita already
let currentWordMapRita = []; // words to display in wordmap for rita

let doneTyping = false; // controls if textBox can be cleared

let fadeOut = 0; // counter to fade out title text slowly
let words; // words from the textbox (array)
let amtWords; // number of words - only set after finished typing

let textBox, submitTextButton; // variables that holds the HTML textbox & button

let titleFont; // font for title
// let myFont; // font description

let dataForRita; // data that rita can use to generate new responses. text file loaded into this variable
let ritaModel; // variable that holds the rita markov model
let responseFromRita = ""; // text generated by the rita markov model

// convert letter to number (used in word2vec)
let letterToNumber = { // ChatGpt4 for reordering/associating the alphabetical object
    "a": "01",
    "b": "02",
    "c": "03",
    "d": "04",
    "e": "05",
    "f": "06",
    "g": "07",
    "h": "08",
    "i": "09",
    "j": "10",
    "k": "11",
    "l": "12",
    "m": "13",
    "n": "14",
    "o": "15",
    "p": "16",
    "q": "17",
    "r": "18",
    "s": "19",
    "t": "20",
    "u": "21",
    "v": "22",
    "w": "23",
    "x": "24",
    "y": "25",
    "z": "26"
};

// text to add to beginning and end of text generated by rita markov model
let ritaQuestionsAfter = [ // question after the response from Rita to sound like a conversation
    "",
    " Do you think so?",
    " and thats a fact",
    " But you know, whatever. Right?",
    " any other questions?"
];

let ritaQuestionsBefore = [ // statement to make the response from Rita more human
    "",
    "True, but also ",
    "Yes, also, ",
    "Well, actually, ",
    "You are right, ",
    "Irrelevant! Now listen, ",
    "Incorrect. "
];


// load text for rita markov model
// load font
function preload() {
    dataForRita = loadStrings("assets/data/text.txt"); // P5js ref to load the text files.
    titleFont = loadFont("assets/fonts/Cako-Regular.ttf"); // loading title font
    bgImg = loadImage("assets/images/Unigrim-BG_Adobe_Stock.png");
    
}





// setup rita markov model
// create textBox and submitTextButton
// set callback getResponseAnswer for submitTextButton
function setup() {
    createCanvas(windowWidth,windowHeight);
    imageMode(CENTER);
    
    //console.log(news);
    //newsJingleSound = loadSound('assets/sounds/181899__zagi2__thrill-announcement-2.wav');

    // setup rita markov model for generating text response
    ritaModel = RiTa.markov(4); // ref from rita
    ritaModel.addText(dataForRita.join(' ')); // ref from rita

    // text Box to input text
    const textBoxWidth = 400; 
    textBox = createInput(""); // field with text 
    textBox.size(textBoxWidth); // size of the box
    textBox.position(width/4 - textBoxWidth/2 - 5, height - 100); // display in box

    //button
    const submitButtonWidth = textBoxWidth/2;
    submitTextButton = createButton("answer");
    submitTextButton.size(textBoxWidth/3);
    submitTextButton.position(width/4 - submitButtonWidth/3,  height - 50);
    submitTextButton.mousePressed(startGetResponseAnswer);

    textAlign(CENTER, CENTER);

    // console.log(voiceOutput.listVoices()); // print the voice options
}

// ENTER does the same thing as submitTextButton
function keyPressed() {
    if (keyCode === ENTER) {
        startGetResponseAnswer();
    }
}

// common method from keyPressed and submitTextButtonCallback
// sets some things up before calling getResponseAnswer
// called from submitTextButton and keyPressed ENTER
function startGetResponseAnswer() {
    doneTyping = true;
    console.log("here");
    let everythingInTextBox = textBox.value() + " ";
    textBox.value(everythingInTextBox);
    getResponseAnswer();
}

// called from startGetResponseAnswer
// generates response text
// calls ritaSayNextWord
function getResponseAnswer() {
    if (scene == "title") {
        scene = "main";
    }
    currentWordMapRita = [];
    voiceOutput.setVoice(`Google UK English Male`);
    responseFromRita = ritaModel.generate();
    // voiceOutput.speak(responseFromRita + "What do you think of that?");
    responseFromRita = random(ritaQuestionsBefore) + responseFromRita + random(ritaQuestionsAfter);
    responseFromRita = responseFromRita.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '); // GPT4 - Regular expression (removing numb & symbols)  
    // voiceOutput.speak(responseFromRita + "?");
    // responseFromRita = random(ritaQuestionsBefore) + responseFromRita + random(ritaQuestionsAfter);
    ritaWillSay = responseFromRita.split(" ");
    ritaSaid = [];
    ritaSayNextWord();
}

// called from getResponseAnswer (first call)
// callback from voiceOutput.onEnd (loops until nothing left in ritaWillSay)
function ritaSayNextWord() { // word appear similarly to the conversation - one at the time
    if (ritaWillSay.length > 0) {
        let nextWord = ritaWillSay[0];
        voiceOutput.speak(nextWord);
        let wordCoords = wordToVec(nextWord);
        currentWordMapRita.push([nextWord, int((wordCoords[0] * (width/3))/10), int((wordCoords[1] * (height/3))/10)]);
        ritaSaid.push(ritaWillSay.shift());
        fadeOut ++;
    }
    else {
        if (doneTyping) {
            textBox.value("");
            doneTyping = false;
        }
    }
}



function draw() {
    push();
    image(bgImg, width/2, height/2);
    noStroke();
    fill(0, 150);
    rect(0, 0, width, height);
    pop();
    
    if (scene == "title") {
        textFont(titleFont);
        textSize(24);
        fill(255);
        text(`I have questions but no queries,\nReplies but no voices,\nConclusions but no judgments.\nWhat am I?`, 450, 200,  );
        
        let textBoxContent = textBox.value(); // identify the word in the textbox
        textBoxContent = textBoxContent.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '); // GPT4 - Regular expression (removing numb & symbols)
        words = textBoxContent.split(" "); // split the sentence in the textbox at each space, and get back a list of words
        if (amtWords != words.length) { // only run once
            amtWords = words.length;
            ritaWillSay = [];
        }
    }
    else if (scene == "main") {
        userQuestion();
        wordMap(words, true); // words on map (see function below)
        ritaAnswerVis();
        titleInstruction();
        // displayNews();
        // checkIfMouseOverWord();
    }
}

// called from draw
// load "words" variable with textBoxContent (excluding last word)
// display word that is currently being written
// call voiceOutput.speak on word that was just written
function userQuestion() {

    fill(255);
    // question entered by user & cleaned
    let textBoxContent = textBox.value(); // identify the word in the textbox
    textBoxContent = textBoxContent.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '); // GPT4 - Regular expression (removing numb & symbols)
    words = textBoxContent.split(" "); // split the sentence in the textbox at each space, and get back a list of words

    // questions display
    let unfinishedWord = words.pop(); // remove the last word of the array and put it in the unfinished word
    text(unfinishedWord, width/2, height/2); // display the last word written by the user
    
    // word.length only changes when the user is done writing a word & adds a space 
    if (amtWords != words.length && doneTyping == false) { // only run once
        amtWords = words.length;
        ritaWillSay = [];
        fadeOut ++;  
        if (words[amtWords - 1]) { // the voice output happening when we start writing the first word
            //console.log("new word in textbox");
            voiceOutput.setVoice(`Google UK English Female`); // why my voice doesn't change? 
            voiceOutput.speak(words[amtWords - 1]); // voice output of the user writing the last word
        }
    }
    textSize(20);
    text(words.join(" "), (width/12), height*0.8, width/3);
}

// called from draw
// display wordmap of contents of ritaSaid variable
function ritaAnswerVis() { // answers from Rita
    if (responseFromRita.length > 0) {
        textSize(25);
        fill(255, 255, 0); // color words from machine middle
        text(ritaSaid[ritaSaid.length - 1], width/2, height/2 - 50);
        wordMap(ritaSaid,false);
        fill(255, 255, 0);
        textSize(20);
        // text(ritaSaid.join(" "), width * 0.6, height * 0.8, width/10);
        text(ritaSaid.join(" "), (width * 0.5) + (width/12), height * 0.8, width/3);
    }
}

// called from draw
// static text and decoration
function titleInstruction() {
    // move this in a function 
    textSize(40);
    fill(255, 255, 255,255 - constrain(fadeOut * 10, 0, 255));
    textFont(titleFont);
    text(`The map is not the territory\nThe response is not the answer`, width/4, height/6);
    fill(255, 255, 255, 90);
    textSize(24);
    text(`The Map of The Words`, width/4, 50);
    textSize(25);
}


function wordMap(currentPhrase, isUser) { // visual of the maps 
    textSize(20);
    push();
        if (isUser) {
            translate(width*0.25, height/2);
            strokeWeight(1);
        }
        else {
            translate(width*0.75, height/2);
            strokeWeight(1);
        }
        
        beginShape(); // drawing the line starts here
        
        //let oldShowNews = showNews;
        //showNews = false;
        //newsWord = "";
        for (let i = 0; i < currentPhrase.length; i++) {
            let vectorResult = wordToVec(currentPhrase[i]); // the magic happens here - turn word into vector (matrices & vectors course got handy here)
            if (isUser) {
                fill(255);
                stroke(255);
                vertex(vectorResult[0] * width/5, vectorResult[1] * height/3); // points connected by the line
                noStroke();
                text(currentPhrase[i], vectorResult[0] * (width/5), vectorResult[1] * (height/3)); // integrating user sentence and position it a the point where we calculated the vectors
                stroke(255);
            }
            else {
                noFill();
                stroke(255, 255, 0);
                // add a little bit of noise to make the rita word map jiggle
                let nx = noise(0.01 * frameCount + i) * 20.0;
                let ny = noise(0.01 * frameCount + i + 9999) * 20.0; 
                fill(255, 255, 0);
                vertex(vectorResult[0] * width/5 + nx, vectorResult[1] * height/3 + ny); // points connected by the line
                noStroke();
                text(currentPhrase[i], vectorResult[0] * (width/5) + nx, vectorResult[1] * (height/3) + ny); // integrating user sentence and position it a the point where we calculated the vectors
                stroke(255, 255, 0);
            }
        }
        // console.log(int((mouseX - width/2)/10));
        noFill();
        //newsJingleSound.play();
        endShape(); // Drawing the line is ended, all the points are defined and the line are connecting it 
    pop();
}

function wordToVec(word) {

    let vectorString = ["0.", "0."]; // array of strings [0,1]

    for (let letterIdx = 0; letterIdx < word.length; letterIdx++) { // indicating each letters in the word 
        let letter = word[letterIdx].toLowerCase(); // get the letter at the Idx above
        let letterNumber = letterToNumber[letter]; // lookup letter in the object to link letter to a number
        
        if (letterIdx <= word.length/2) { // first half of the word (x)
            vectorString[0] += letterNumber; // add digits to vector string (x)
        }
        else { // second half of the word
            vectorString[1] += letterNumber; // add digits to vector string (y)
        }
    }
    // turn the vector x,y into number
    let x = Number(vectorString[0]); 
    let y = Number(vectorString[1]); 

    // scaling the number 
    let vector = [
        (x * 3.3) * 2 - 1,
        (y * 3.3) * 2 - 1
    ]
    return vector; // pooping it out
}

