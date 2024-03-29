// Idea # 2
// Map of the words - the map is not the territory / the response is not the answer. 

"use strict";

let news;

const voiceOutput = new p5.Speech(); // variables to output speech (class)
let voiceText = ""; // empty strings

let fadeOut = 0;
let words; // array(list) of strings(words) held here
let amtWords; // number of words - only set after finished typing

let textBox, submitTextButton; // variables that holds the HTML textbox & button

let titleFont; // font title
// let myFont; // font description

let dataForRita;// array of the lines in the text file
let ritaModel; // object generating text from the rita
let responseFromRita = ""; // string to hold rita

voiceOutput.onEnd = ritaSayNextWord;
voiceOutput.interrupt = true;
let ritaWillSay = [];
let ritaSaid = [];

let showNews = false; // if mouse is over a word
let newsWord = ""; // word we will get info about

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

let ritaQuestionsAfter = [ // question after the response from Rita to sound like a conversation
    "",
    "Do you think so?",
    "That is my opinion, what is yours?",
    "But you know, whatever. Right?",
    "Which is not at all what you were saying"
];

let ritaQuestionsBefore = [ // statement to make the response from Rita more human
    "",
    "Well, I think, ",
    "I am not sure, but, ",
    "Well, actually, ",
    "You are right, that's why i always say, ",
    "Irrelevant! Now listen, ",
    "Sure, but let me tell you this, "
];

function preload() {
    dataForRita = loadStrings("assets/data/text.txt"); // P5js ref to load the text files.
    titleFont = loadFont("assets/fonts/dahlia-regularcondensed.otf"); // loading title font
    // myFont = loadFont("assets/fonts/WorkSans-Light.ttf"); // loading text font
    const proxyUrl = "https://cors-anywhere.herokuapp.com/"
    const qInTitle = "Trump";
    const from = "us";
    const apiKey = "c3396e37e9bf493381de2ddc7c175ba3";
    news = loadJSON(`https://newsapi.org/v2/everything?qInTitle=${qInTitle}&from=${from}language=en&apiKey=${apiKey}`);
}

function setup() {
    createCanvas(windowWidth,windowHeight);
    console.log(news);

    ritaModel = RiTa.markov(4); // ref from rita
    ritaModel.addText(dataForRita.join(' ')); // ref from rita

    // text Box to input text
    const textBoxWidth = 400; 
    textBox = createInput(""); // field with text 
    textBox.size(textBoxWidth); // size of the box
    textBox.position(width/2 - textBoxWidth/2, height - 100); // display in box

    //button
    const submitButtonWidth = textBoxWidth/2;
    submitTextButton = createButton("answer");
    submitTextButton.size(textBoxWidth/3);
    submitTextButton.position(width/2 - submitButtonWidth/3,  height - 50);
    submitTextButton.mousePressed(getResponseAnswer);

    textAlign(CENTER, CENTER);

    console.log(voiceOutput.listVoices()); 

    // Reference ChatGPT4
    // let originalString = "This is a sample string, with numbers 123 and symbols !@#.";
    // let cleanedString = originalString.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
    // console.log(cleanedString);
    // Result: This is a sample string, with numbers and symbols.
}

function getResponseAnswer() {
    
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

function draw() {
    background(240,248,255); 
    userQuestion();
    wordMap(words, true); // words on map (see function below)
    ritaAnswerVis();
    titleInstruction();
    displayNews();

}

function displayNews() {
    if (showNews) { 
        fill(0);
        rect(0, 0, 200, 200);
        fill(255);
        stroke(255);
        text(newsWord, 100, 100);
    }
}

function ritaSayNextWord() { // word appear similarly to the conversation - one at the time
    if (ritaWillSay.length > 0) {
        let nextword = ritaWillSay[0];
        voiceOutput.speak(nextword);
        ritaSaid.push(ritaWillSay.shift());
        fadeOut ++; 
    }
}

function ritaAnswerVis() { // answers from Rita
    if (responseFromRita.length > 0) {
        // textSize(20);
        text(ritaSaid[ritaSaid.length - 1], width/2, height/2 - 50);
        wordMap(ritaSaid,false);
    }
}

function titleInstruction() {
    // move this in a function 
    textSize(45);
    fill(56,56,56,255 - constrain(fadeOut * 10, 0, 255));
    // text(textBox.value(), width/2, height/3);
    textFont(titleFont);
    text(`The map is not the territory\nThe response is not the answer`, width/2, height/4);
    fill(56,56,56);
    textSize(25);
    text(`The Map of The Words`, width/2, 50);
    textSize(25);
    text(`Let's discuss.`, width/2, height - 200);
    textSize(25);
}

function userQuestion() {

    // question entered by user & cleaned out
    let textBoxContent = textBox.value(); // identify the word in the textbox
    textBoxContent = textBoxContent.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '); // GPT4 - Regular expression (removing numb & symbols)
    words = textBoxContent.split(" "); // split the sentence in the textbox at each space, and get back a list of words

    // questions display
    let unfinishedWord = words.pop(); // remove the last word of the array and put it in the unfinished word
    text(unfinishedWord, width/2, height/2); // display the last word written by the user
    
    // word.length only changes when the user is done writing a word & adds a space 
    if (amtWords != words.length) { // only run once
        amtWords = words.length;
        ritaWillSay = [];
        fadeOut ++;  
        if (words[amtWords - 1]) { // the voice output happening when we start writing the first word
            voiceOutput.setVoice(`Google UK English Female`); // why my voice doesn't change? 
            voiceOutput.speak(words[amtWords - 1]); // voice output of the user writing the last word
        }
    }
}

function wordMap(currentPhrase, isUser) { // visual of the maps 
    textSize(15);
    push();
        translate(width/2, height/2);
        beginShape(); // drawing the line starts here
        showNews = false;
        newsWord = "";
        for (let i = 0; i < currentPhrase.length; i++) {
            let vectorResult = wordToVec(currentPhrase[i]); // the magic happens here - turn word into vector (matrices & vectors course got handy here)
            if (isUser) {
                fill(255,140,140);
            }
            else {
                fill(54,124,43);
            }
            vertex(vectorResult[0] * width/3, vectorResult[1] * height/3); // points connected by the line
            text(currentPhrase[i], vectorResult[0] * (width/3), vectorResult[1] * (height/3)); // integrating user sentence and position it a the point where we calculated the vectors
            
            // round up to make the mouse recognize word easier
            if (int((mouseX - (width/2))/10) == int((vectorResult[0] * (width/3))/10) && 
                int((mouseY - (height/2))/10) == int((vectorResult[1] * (height/3))/10)) {
                    showNews = true;
                    newsWord = currentPhrase[i];
            }
        }
        // console.log(int((mouseX - width/2)/10));
        noFill();
        stroke(0, 100);
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