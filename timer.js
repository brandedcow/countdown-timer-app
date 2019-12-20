const timer = document.getElementById('timer')
const timerDisplay = document.getElementById('timer-display')
const actionButton = document.getElementById('action-button')
const resetButton = document.getElementById('reset-button')
const pseudoTicker = document.getElementById('pseudo-ticker')

const audioBeep = new Audio('assets/beep.wav')

let timerID, beeperID, startTime, currentTime, endTime, 
    initialDurationString = "00050000"
    timerDisplayDigits = [...initialDurationString], 
    cursorPosition = 5

//-------- setup app
renderBackgroundAndTimer()
actionButton.onclick = startTimer
resetButton.onclick = resetTimer

//-------- timer display as input
timerDisplay.onclick = function(event) {
    if (timerStarted()) return

    if (event.target.classList.contains('digit-container')) {
        cursorPosition = Number.parseInt(event.target.id)
    }
    renderCursor()
}

timerDisplay.onblur = function(event) {
    removeCursor()
}

// digits keys
timerDisplay.onkeypress = function(event) {
    let keyPressed = event.key
    if (timerStarted() || !isDigit(keyPressed)) return

    let editedPart = timerDisplayDigits.slice(0, cursorPosition + 1)
    let uneditedPart = timerDisplayDigits.slice(cursorPosition + 1)
    editedPart.shift()
    editedPart.push(event.key)
    timerDisplayDigits = [...editedPart, ...uneditedPart]

    renderTimerDisplay()
}

// funtion keys
timerDisplay.onkeydown = function(event) {
    let keyPressed = event.key
    if (timerStarted()) return
    switch(keyPressed) {
        case "Backspace": {
            let editedPart = timerDisplayDigits.slice(0, cursorPosition + 1)
            let uneditedPart = timerDisplayDigits.slice(cursorPosition + 1)
            editedPart.pop()
            editedPart.unshift("0")
            timerDisplayDigits = [...editedPart, ...uneditedPart]
            renderTimerDisplay()
            break;
        }
        case "ArrowLeft" : {
            cursorPosition = Math.max(cursorPosition - 1, 0)
            renderCursor()
            break;
        }
        case "ArrowRight" : {
            cursorPosition = Math.min(cursorPosition + 1, 5)
            renderCursor()
            break;
        }
        case "Enter": {
            startTimer()
            break;
        }
    }
}

//-------- actions
function startTimer() {
    currentTime = new Date().getTime()
    if (!startTime) {
        startTime = currentTime
        initialDurationString = timerDisplayDigits.join("")
    }
    let duration = getDurationInCentiseconds(timerDisplayDigits)
    endTime = currentTime + duration * 10
    timerID = setInterval(countdown, 50)

    removeCursor()

    timerDisplay.style.opacity = 1

    setActionButton("STOP")
}

function countdown() {
    currentTime = new Date().getTime()
    let durationLeft = Math.floor(endTime - currentTime)

    if (durationLeft <= 0) {
        durationLeft = 0
        stopTimer()
        playBeeps()
        setActionButton("OK")
    }

    durationLeft /= 10
    let hours = Math.floor(durationLeft / 360000)
    let minutes = Math.floor((durationLeft - (hours * 360000)) / 6000)
    let seconds = Math.floor((durationLeft - (hours * 360000) - (minutes * 6000)) / 100)
    let centiseconds = Math.floor(durationLeft - (hours * 360000) - (minutes * 6000) - (seconds * 100))
   
    let durationString = hours.toString().padStart(2, '0') + minutes.toString().padStart(2,'0') + seconds.toString().padStart(2, '0') + centiseconds.toString().padStart(2, '0')
    timerDisplayDigits = [...durationString]

    renderBackgroundAndTimer()
}

function stopTimer() {
    clearInterval(timerID)

    setActionButton("START")

    timerDisplay.style.opacity = 0.5
}

function resetTimer() {
    stopTimer()
    startTime = currentTime = endTime = null
    timerDisplayDigits = [ ...initialDurationString]

    stopBeeps()

    renderBackgroundAndTimer()
}

function playBeeps() {
    beeperID = setInterval(() => {
        audioBeep.play()
    }, 1000)
}

function stopBeeps() {
    clearInterval(beeperID)
}

//-------- render functions
function renderBackgroundAndTimer() {
    renderTimerDisplay()
    renderBackground()
}

function renderTimerDisplay() {
    timerDisplayDigits.map((digit, digitId) => {
        let digitContainer = document.getElementById(digitId)
        digitContainer.innerHTML = digit
    })
}

function removeCursor() {
    let digitContainers = Array.from(document.getElementsByClassName('digit-container'))
    digitContainers.forEach(digitContainer => {
        digitContainer.classList.remove('active-digit')
    })
}

function renderCursor() {
    removeCursor()

    let selectedElement = document.getElementById(cursorPosition)
    selectedElement.classList.add('active-digit')
}

function renderBackground() {
    const elapsedTime = currentTime - startTime
    const totalTime = endTime - startTime
    let elapsedPercent = Math.min(1, elapsedTime / totalTime)

    if (elapsedPercent > .50) {
        elapsedPercent -= .5 
        pseudoTicker.style.backgroundColor = "#EC7063"
        pseudoTicker.style.transform = `translate(0vw, -33%) rotate(${elapsedPercent}turn)`
    } else if (elapsedPercent <= .50) {
        pseudoTicker.style.backgroundColor = "inherit"
        pseudoTicker.style.transform = `translate(0vw, -33%) rotate(${elapsedPercent}turn)`
    } else {
        pseudoTicker.style.transform = `translate(0vw, -33%)`
        pseudoTicker.style.backgroundColor = "inherit"
    }

}

function setActionButton(type) {
    actionButton.classList.remove('start-button')
    actionButton.classList.remove('stop-button')
    actionButton.classList.remove('ok-button')

    switch(type) {
        case "OK": {
            actionButton.innerHTML = "OK"
            actionButton.onclick = stopBeeps
            actionButton.classList.add('ok-button')
            break;
        }
        case "START": {
            actionButton.innerHTML = "START"
            actionButton.onclick = startTimer
            actionButton.classList.add('start-button')
            break;
        }
        case "STOP": {
            actionButton.innerHTML = "STOP"
            actionButton.onclick = stopTimer
            actionButton.classList.add('stop-button')
            break;
        }
    }
}

//-------- helper functions
function timerStarted () { return !!endTime } 

function isDigit(str) {
    let digitRegex = new RegExp(/[0-9]/, 'g')
    return digitRegex.test(str)
}

function getDurationInSeconds(arr) {
    let hours = Number(arr[0] + arr[1])
    let minutes = Number(arr[2] + arr[3])
    let seconds = Number(arr[4] + arr[5])
    
    return seconds + (minutes * 60) + (hours * 3600)
}

function getDurationInCentiseconds(arr) {
    let hours = Number(arr[0] + arr[1])
    let minutes = Number(arr[2] + arr[3])
    let seconds = Number(arr[4] + arr[5])
    let centiseconds = Number(arr[6] + arr[7])
    
    return (hours * 360000) + (minutes * 6000) + (seconds * 100) + centiseconds
}