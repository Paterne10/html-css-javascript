let randomLeftNumber = Math.floor(Math.random()* 6) + 1

let randomDiceImage = "dice" + randomLeftNumber + ".png"

let sourceImage = "images/" + randomDiceImage

let image1 = document.querySelectorAll("img")[0]

image1.setAttribute("src", sourceImage)

// Generate the second image

let randomRightNumber = Math.floor(Math.random()* 6) + 1

let randomDiceImage2 = "dice" + randomRightNumber + ".png"

let sourceImage2 = "images/" + randomDiceImage2

let image2 = document.querySelectorAll("img")[1]

image2.setAttribute("src", sourceImage2)

// Who wins ? 

let title = document.querySelector("h1")

if(randomLeftNumber > randomRightNumber ){
    title.textContent = "Player 1 wins"
}

else if (randomLeftNumber < randomRightNumber){
    title.textContent = "Player 2 wins"
}

else{
    title.textContent = "Draw"
}