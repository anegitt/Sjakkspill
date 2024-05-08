const spillbrett = document.querySelector("#spillbrett")
const spillerTur = document.querySelector("#spillertur")
const infoOmSpillet = document.querySelector("#info")
const bredde = 8
let hvemSinTur = "hvit"
spillerTur.textContent = "hvit"
let truendeBrikke
let brikke

const startbrikker = [
    torn, hest, loper, dronning, konge, loper, hest, torn,
    bonde, bonde, bonde, bonde, bonde, bonde, bonde, bonde,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    bonde, bonde, bonde, bonde, bonde, bonde, bonde, bonde,
    torn, hest, loper, dronning, konge, loper, hest, torn
]

function lagSpillBrett() {
    startbrikker.forEach(function (startBrikke, i) {
        const rute = document.createElement("div")
        rute.classList.add("rute")
        rute.innerHTML = startBrikke
        rute.firstChild?.setAttribute('draggable', true)
        rute.setAttribute("ruteId", 63 - i)
        const rad = Math.floor((63 - i) / 8) + 1
        rute.setAttribute("rad", rad)
        const kolonne = i % 8 + 1;
        rute.setAttribute("kolonne", kolonne)

        if (rad % 2 === 0) {
            rute.classList.add(i % 2 === 0 ? "lys" : "mork")
        } else {
            rute.classList.add(i % 2 === 0 ? "mork" : "lys")
        }
        if (i <= 15) {
            rute.firstChild.classList.add('svart')
        }
        if (i >= 48) {
            rute.firstChild.classList.add('hvit')
        }
        spillbrett.append(rute)
    })
}
lagSpillBrett()

const alleRuter = document.querySelectorAll(".rute")

alleRuter.forEach(function (enkeltRute) {
    enkeltRute.addEventListener("dragstart", PlukkOppBrikke)
    enkeltRute.addEventListener("dragover", UnderFlytt)
    enkeltRute.addEventListener("drop", SlippEtterFlytt)
})

let startPosisjonId
let flyttetElement
let startPosisjon

function PlukkOppBrikke(e) {
    startPosisjonId = e.target.parentNode.getAttribute("ruteId")
    startPosisjon = e.target.parentNode //dette er ruten den starter i 
    flyttetElement = e.target
}

function UnderFlytt(e) {
    e.preventDefault()
}

function SlippEtterFlytt(e) {
    e.stopPropagation()
    const tatt = e.target.classList.contains("brikke")
    const riktigTur = flyttetElement.classList.contains(hvemSinTur)
    const gyldig = sjekkGyldighet(e.target)
    const motstander = hvemSinTur === "hvit" ? "svart" : "hvit"
    const tattAvMotstander = e.target.classList.contains(motstander)

    if (riktigTur) {
        if (gyldig && tattAvMotstander) {
            e.target.parentNode.append(flyttetElement)
            e.target.remove()
            if (storISjakk()) {
                flyttetElement.remove()
                startPosisjon.append(flyttetElement)
                infoOmSpillet.innerHTML = "Du står i sjakk"

                setTimeout(function () {
                    infoOmSpillet.innerHTML = ""
                }, 3000)
                return
            }
            hvemSkalFlytte()
            vinnerAvSpillet()
            return
        } else if (tatt && !tattAvMotstander) {
            // kan ikke ta sin egen brikke
            return
        } else if (gyldig) {
            e.target.append(flyttetElement)
            if (storISjakk()) {
                flyttetElement.remove()
                startPosisjon.append(flyttetElement)
                infoOmSpillet.innerHTML = "Du står i sjakk"

                setTimeout(function () {
                    infoOmSpillet.innerHTML = ""
                }, 3000)
                return
            }
            hvemSkalFlytte()
            vinnerAvSpillet()
            return
        }
    }
}

function finnesGyldigTrekk() {

    const alleEgneBrikker = document.querySelectorAll("." + hvemSinTur)
    for (let egenBrikkeIdx = 0; egenBrikkeIdx < alleEgneBrikker.length; egenBrikkeIdx++) {
        const egenBrikke = alleEgneBrikker[egenBrikkeIdx]

        brikke = egenBrikke
        const alleRuter = document.querySelectorAll(".rute")

        for (let alleRuterIdx = 0; alleRuterIdx < alleRuter.length; alleRuterIdx++) {
            const ruten = alleRuter[alleRuterIdx]

            const tatt = ruten.classList.contains("brikke")
            const tattAvMotstander = ruten.firstChild?.classList.contains(hvemSinTur === "hvit" ? "svart" : "hvit")
            const gyldig = sjekkGyldighet(ruten)

            if (gyldig && tattAvMotstander && !storISjakk()) {
                //hvis en rute har den andre fargen sin brikke og trekket er gyldig er dette et gyldig trekk for den hvite brikken
                return true
            }  else if (gyldig && !tatt && !storISjakk()) {
                return true
            } 
        }
    }
    return false
}

function vinnerAvSpillet() {
    if (finnesGyldigTrekk() === false) {
        infoOmSpillet.innerHTML = "Det er sjakkmatt"
    }
}

function hvemSkalFlytte() {
    if (hvemSinTur === "hvit") {
        hvemSinTur = "svart"
        spillerTur.textContent = "svart"
        snuBrettTilSvartTur()
    } else {
        hvemSinTur = "hvit"
        spillerTur.textContent = "hvit"
        snuBrettTilHvitTur()
    }
}

function snuBrettTilHvitTur() {
    const alleRuter = document.querySelectorAll(".rute")
    alleRuter.forEach(function (enkeltRute, i) {
        enkeltRute.setAttribute("ruteId", bredde * bredde - 1 - i)
    })
}

function snuBrettTilSvartTur() {
    const alleRuter = document.querySelectorAll(".rute")
    alleRuter.forEach(function (enkeltRute, i) {
        enkeltRute.setAttribute("ruteId", i)
    })
}

function sjekkGyldighet(ruten) {
    const sluttRute = Number(ruten.getAttribute("ruteId")) || Number(ruten.parentNode.getAttribute("ruteId"))
    let startRute
    let typeBrikke

    if (truendeBrikke) {
        typeBrikke = truendeBrikke.id
        startRute = truendeBrikke.parentNode.getAttribute("ruteId")
    } else if (flyttetElement) {
        typeBrikke = flyttetElement.id
        startRute = Number(startPosisjonId)
    } else if (brikke) {
        typeBrikke = brikke.id
        startRute = brikke.parentNode.getAttribute("ruteId")
    }

    // let startRad = document.querySelector(`[ruteId="${startRute}"]`).getAttribute("rad")
    // let startKolonne = document.querySelector(`[ruteId="${startRute}"]`).getAttribute("kolonne")
    // let sluttRad = document.querySelector(`[ruteId="${sluttRute}"]`).getAttribute("rad")
    // let sluttKolonne = document.querySelector(`[ruteId="${sluttRute}"]`).getAttribute("kolonne")

    // // hvis deltaX er negativ har den gått mot høyre, sjekk avstand mot kolonne 8 
    // // hvis deltaX er positiv har den gått mot venstre, sjekk avstand mot kolonne 1
    // let deltaX = startKolonne - sluttKolonne
    // if (deltaX < 0 && 8 - startKolonne > Math.abs(deltaX)) {
    //     return false
    // } else if (deltaX > 0 && startKolonne > deltaX) {
    //     return false
    // }

    // // hvis deltaY er negativ har den gått oppover, sjekk avstand til rad 8
    // // hvis deltaY er positiv har den gått nedover, sjekk avstand tiil rad 1 
    // let deltaY = startRad - sluttRad
    // if (deltaY < 0 && 8 - startRad < Math.abs(deltaY)) {
    //     return false
    // } else if (deltaY > 0 && startRad < deltaY) {
    //     return false
    // }

    switch (typeBrikke) {
        case "konge":
            if (
                startRute + bredde === sluttRute ||
                startRute - bredde === sluttRute ||
                startRute + 1 === sluttRute ||
                startRute - 1 === sluttRute ||
                startRute + bredde + 1 === sluttRute ||
                startRute + bredde - 1 === sluttRute ||
                startRute - bredde + 1 === sluttRute ||
                startRute - bredde - 1 === sluttRute
            ) {
                return true
            } else {
                return false
            }
        case "bonde":
            const startRad = [8, 9, 10, 11, 12, 13, 14, 15]
            if (
                startRad.includes(startRute) && startRute + bredde * 2 === sluttRute ||
                startRute + bredde === sluttRute ||
                startRute + bredde - 1 === sluttRute && document.querySelector(`[ruteId = "${startRute + bredde - 1}"]`).firstChild ||
                startRute + bredde + 1 === sluttRute && document.querySelector(`[ruteId = "${startRute + bredde + 1}"]`).firstChild
            ) {
                return true
            } else {
                return false
            }
        case "hest":
            if (
                startRute + bredde * 2 + 1 === sluttRute ||
                startRute + bredde * 2 - 1 === sluttRute ||
                startRute - bredde * 2 + 1 === sluttRute ||
                startRute - bredde * 2 - 1 === sluttRute ||
                startRute + bredde + 2 === sluttRute ||
                startRute + bredde - 2 === sluttRute ||
                startRute - bredde + 2 === sluttRute ||
                startRute - bredde - 2 === sluttRute
            ) {
                return true
            } else {
                return false
            }
        case "loper":
            if (
                startRute + bredde + 1 === sluttRute ||
                startRute + bredde * 2 + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild ||
                startRute + bredde * 3 + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild ||
                startRute + bredde * 4 + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild ||
                startRute + bredde * 5 + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild ||
                startRute + bredde * 6 + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 + 5}"]`).firstChild ||
                startRute + bredde * 7 + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6 + 6}"]`).firstChild ||

                startRute + bredde - 1 === sluttRute ||
                startRute + bredde * 2 - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild ||
                startRute + bredde * 3 - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild ||
                startRute + bredde * 4 - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild ||
                startRute + bredde * 5 - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild ||
                startRute + bredde * 6 - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 - 5}"]`).firstChild ||
                startRute + bredde * 7 - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6 - 6}"]`).firstChild ||

                startRute - bredde + 1 === sluttRute ||
                startRute - bredde * 2 + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild ||
                startRute - bredde * 3 + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild ||
                startRute - bredde * 4 + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild ||
                startRute - bredde * 5 + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild ||
                startRute - bredde * 6 + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 + 5}"]`).firstChild ||
                startRute - bredde * 7 + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6 + 6}"]`).firstChild ||

                startRute - bredde - 1 === sluttRute ||
                startRute - bredde * 2 - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild ||
                startRute - bredde * 3 - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild ||
                startRute - bredde * 4 - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild ||
                startRute - bredde * 5 - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild ||
                startRute - bredde * 6 - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 - 5}"]`).firstChild ||
                startRute - bredde * 7 - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6 - 6}"]`).firstChild
            ) {
                return true
            } else {
                return false
            }
        case "torn":
            if (
                startRute + bredde === sluttRute ||
                startRute + bredde * 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild ||
                startRute + bredde * 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild ||
                startRute + bredde * 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild ||
                startRute + bredde * 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild ||
                startRute + bredde * 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6}"]`).firstChild ||
                startRute + bredde * 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6}"]`).firstChild ||

                startRute - bredde === sluttRute ||
                startRute - bredde * 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild ||
                startRute - bredde * 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild ||
                startRute - bredde * 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild ||
                startRute - bredde * 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild ||
                startRute - bredde * 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6}"]`).firstChild ||
                startRute - bredde * 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6}"]`).firstChild ||

                startRute + 1 === sluttRute ||
                startRute + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild ||
                startRute + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild ||
                startRute + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild ||
                startRute + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild ||
                startRute + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 6}"]`).firstChild ||
                startRute + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 6}"]`).firstChild ||

                startRute - 1 === sluttRute ||
                startRute - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild ||
                startRute - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild ||
                startRute - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild ||
                startRute - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild ||
                startRute - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 6}"]`).firstChild ||
                startRute - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 6}"]`).firstChild
            ) {
                return true
            } else {
                return false
            }
        case "dronning":
            if (
                startRute + bredde === sluttRute ||
                startRute + bredde * 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild ||
                startRute + bredde * 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild ||
                startRute + bredde * 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild ||
                startRute + bredde * 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild ||
                startRute + bredde * 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6}"]`).firstChild ||
                startRute + bredde * 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6}"]`).firstChild ||

                startRute - bredde === sluttRute ||
                startRute - bredde * 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild ||
                startRute - bredde * 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild ||
                startRute - bredde * 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild ||
                startRute - bredde * 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild ||
                startRute - bredde * 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6}"]`).firstChild ||
                startRute - bredde * 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6}"]`).firstChild ||

                startRute + 1 === sluttRute ||
                startRute + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild ||
                startRute + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild ||
                startRute + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild ||
                startRute + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild ||
                startRute + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 6}"]`).firstChild ||
                startRute + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + 6}"]`).firstChild ||

                startRute - 1 === sluttRute ||
                startRute - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild ||
                startRute - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild ||
                startRute - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild ||
                startRute - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild ||
                startRute - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 6}"]`).firstChild ||
                startRute - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - 6}"]`).firstChild ||

                startRute + bredde + 1 === sluttRute ||
                startRute + bredde * 2 + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild ||
                startRute + bredde * 3 + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild ||
                startRute + bredde * 4 + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild ||
                startRute + bredde * 5 + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild ||
                startRute + bredde * 6 + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 + 5}"]`).firstChild ||
                startRute + bredde * 7 + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6 + 6}"]`).firstChild ||

                startRute + bredde - 1 === sluttRute ||
                startRute + bredde * 2 - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild ||
                startRute + bredde * 3 - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild ||
                startRute + bredde * 4 - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild ||
                startRute + bredde * 5 - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild ||
                startRute + bredde * 6 - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 - 5}"]`).firstChild ||
                startRute + bredde * 7 - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute + bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 5 - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute + bredde * 6 - 6}"]`).firstChild ||

                startRute - bredde + 1 === sluttRute ||
                startRute - bredde * 2 + 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild ||
                startRute - bredde * 3 + 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild ||
                startRute - bredde * 4 + 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild ||
                startRute - bredde * 5 + 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild ||
                startRute - bredde * 6 + 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 + 5}"]`).firstChild ||
                startRute - bredde * 7 + 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde + 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 + 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 + 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 + 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 + 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6 + 6}"]`).firstChild ||

                startRute - bredde - 1 === sluttRute ||
                startRute - bredde * 2 - 2 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild ||
                startRute - bredde * 3 - 3 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild ||
                startRute - bredde * 4 - 4 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild ||
                startRute - bredde * 5 - 5 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild ||
                startRute - bredde * 6 - 6 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 - 5}"]`).firstChild ||
                startRute - bredde * 7 - 7 === sluttRute && !document.querySelector(`[ruteId="${startRute - bredde - 1}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 2 - 2}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 3 - 3}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 4 - 4}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 5 - 5}"]`).firstChild && !document.querySelector(`[ruteId="${startRute - bredde * 6 - 6}"]`).firstChild
            ) {
                return true
            } else {
                return false
            }
    }
}

function storISjakk() {
    let kongeErISjakk = false

    const alleBrikker = Array.from(document.querySelectorAll(".brikke"))
    const konger = Array.from(document.querySelectorAll("#konge"))

    let hvitKongeRute
    let svartKongeRute

    konger.forEach(function (enkeltKonge) {
        if (enkeltKonge.classList.contains("hvit")) {
            hvitKongeRute = enkeltKonge.parentNode
        } else {
            svartKongeRute = enkeltKonge.parentNode
        }
    })

    alleBrikker.forEach(function (enkeltBrikke) {

        if (enkeltBrikke.classList.contains("hvit")) {
            truendeBrikke = enkeltBrikke
            if (sjekkGyldighet(svartKongeRute)) {
                kongeErISjakk = true
            }
            truendeBrikke = null
        } else {
            truendeBrikke = enkeltBrikke
            if (sjekkGyldighet(hvitKongeRute)) {
                kongeErISjakk = true
            }
            truendeBrikke = null
        }
    })
    return kongeErISjakk
}
