

"use strict";
// First idea with the chinese room. 
// maybe add another viet rec 
// const voiceReconViet = new p5.SpeechRec(`Linh`);

// Max alternative ? (least confident results) - https://editor.p5js.org/pippinbarr/sketches/dyoCU6PJU

const voiceRecon = new p5.SpeechRec();
const voiceSynth = new p5.Speech();
let feeling = 8;

let understood = false;

let voiceText = ""; // empty string

const voiceSay = [
    "Cái gì cơ? Tôi không hiểu bạn nói gì hết!", // "What? I don't understand what you're saying at all!"
    "Nói cái gì đấy? Nói to lên, tôi không nghe rõ.", // "What are you saying? Speak up, I can't hear clearly."
    "Bạn nói nhảm nhí gì thế? Tôi chẳng hiểu gì cả.", // "What nonsense are you talking about? I don't understand anything."
    "Làm ơn, nói cho rõ ràng vào.", // "Please, make it clear."
    "Tôi không biết bạn đang cố gắng nói gì đâu.", // "I have no idea what you're trying to say."
    "Hình như tôi hiểu một chút, nhưng nói rõ hơn được không?", // "I think I understand a bit, but can you clarify?"
    "Có vẻ như bạn đang nói về cái gì đó, nhưng không rõ lắm.", // "It seems like you're talking about something, but it's not very clear."
    "À, có lẽ tôi bắt đầu hiểu rồi, tiếp tục nói đi.", // "Ah, maybe I'm starting to understand, go on."
    "Chờ đã, bạn nói về cái gì đấy à? Hãy giải thích kỹ hơn.", // "Wait, are you talking about something? Explain more."
    "Ồ, giờ tôi hiểu bạn nói gì rồi đấy.", // "Oh, now I understand what you're saying."
    "À, thì ra là vậy. Bạn nói tiếp đi.", // "Ah, so that's it. Go on."
    "Hả, thật thú vị. Tôi không nghĩ là mình sẽ hiểu, nhưng giờ thì có.", // "Huh, interesting. I didn't think I would understand, but now I do."
    "Tôi bắt đầu cảm thấy bạn rồi đấy.", // "I'm starting to feel you now."
    "À, cuối cùng thì tôi cũng hiểu bạn muốn nói gì. Cảm ơn bạn đã giải thích.", // "Ah, finally I understand what you want to say. Thank you for explaining."
    "Thật tuyệt vời khi được hiểu nhau như thế này.", // "It's wonderful to understand each other like this."
    "Giờ thì tôi hiểu bạn rồi. Cảm ơn vì đã kiên nhẫn.", // "Now I understand you. Thanks for being patient."
    "Tôi rất trân trọng việc bạn đã cố gắng nói cho tôi hiểu. Cảm ơn bạn.", // "I really appreciate that you tried to make me understand. Thank you."
    "Bây giờ tôi cảm thấy như chúng ta đã hiểu nhau từ lâu lắm rồi." // "Now I feel like we've understood each other for a long time."
  ];
  
function preload() {

}

function setup() {
    createCanvas(windowWidth, windowHeight);
    voiceSynth.setVoice(`Linh`);
    
    textAlign(CENTER, CENTER);
    textSize(20);

    voiceRecon.continuous = true;
    voiceRecon.onResult = gotVoiceResult;
    voiceRecon.start();
    voiceRecon.InterimResults = true;
} 

function draw() {
    background(0);
    fill(255);
    text(voiceText, width/2, height/2);
}

function gotVoiceResult() { // https://editor.p5js.org/pippinbarr/sketches/dyoCU6PJU
    if (voiceRecon.resultConfidence > 0 && understood === true) {
        feeling -= 1;
        feeling = constrain(feeling,0, voiceSay.length);
        voiceText = " Ồ! vâng, tôi biết ý bạn là gì! " +  voiceRecon.resultString;
        understood = false;
        console.log("conf: " + voiceRecon.resultConfidence);
        console.log("string: " + voiceRecon.resultString);
    }
    else {
        voiceText = (voiceSay[feeling]);
        feeling += 1;
        feeling = constrain(feeling, 0, voiceSay.length); 
        understood = true;
    }
    voiceSynth.speak(voiceText);
    // add timer to change understood to true (so that it doesnt do nothing for a long time)
}

